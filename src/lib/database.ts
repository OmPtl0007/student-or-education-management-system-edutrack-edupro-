// ============================================================
// database.ts — MySQL-backed version
//
// HOW IT WORKS:
//   Before:  every method read/wrote localStorage instantly (sync)
//   Now:     every method calls your PHP API and returns a Promise
//
// WHAT CHANGED vs the old file:
//   - No more localStorage.getItem / setItem anywhere
//   - save() and load() are gone (PHP+MySQL handles persistence)
//   - initializeSampleData() is gone (add sample data via phpMyAdmin)
//   - All methods are now async and return Promises
//   - The DS structures (LinkedList, BST, Heap) are kept in-memory
//     so the existing pages that use them still work — they are
//     refreshed from MySQL every time you call loadAll()
//
// IMPORTANT: Because methods are now async, every page that calls
//   db.addStudent(), db.addAttendance(), etc. must use await or .then()
//   See the updated page files below.
// ============================================================

import { api } from './api';
import { LinkedList, StudentNode } from './ds/linked-list';
import { SimpleQueue } from './ds/queue';
import { HashTable } from './ds/hash-table';
import { BST } from './ds/bst';
import { MaxHeap, HeapStudent } from './ds/max-heap';
import { FirstFitAllocator } from './ds/first-fit';

export interface AttendanceRecord {
  id?: number;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent';
  subject: string;
}

export interface AcademicScore {
  id?: number;
  studentId: string;
  scoreType: string;
  value: number;
}

export interface LeaveRequest {
  id: number;
  studentId: string;
  reason: string;
  leaveType: string;
  priority: number;
  status: string;
  date: string;
}

export interface Document {
  id: number;
  studentId: string;
  name: string;
  type: string;
  date: string;
}

export interface SystemLog {
  id?: number;
  timestamp: string;
  action: string;
  user?: string;
}

class EduTrackDatabase {
  // In-memory DS structures (kept for sorting/search pages)
  studentList: LinkedList;
  registrationQueue: SimpleQueue;
  studentHashTable: HashTable<StudentNode>;
  studentBST: BST;
  scholarshipHeap: MaxHeap;
  memoryAllocator: FirstFitAllocator;

  // In-memory cache (refreshed from MySQL)
  attendance: AttendanceRecord[] = [];
  academicScores: AcademicScore[] = [];
  leaveRequests: LeaveRequest[] = [];
  documents: Document[] = [];
  systemLogs: SystemLog[] = [];

  constructor() {
    this.studentList      = new LinkedList();
    this.registrationQueue = new SimpleQueue();
    this.studentHashTable = new HashTable<StudentNode>(53);
    this.studentBST       = new BST();
    this.scholarshipHeap  = new MaxHeap();
    this.memoryAllocator  = new FirstFitAllocator();
  }

  // ============================================================
  // loadAll()
  // Call this once when your app starts (in main.tsx or App.tsx)
  // It fetches everything from MySQL and rebuilds the DS structures
  // ============================================================
  async loadAll() {
    try {
      const students: StudentNode[] = await api.getStudents();

      // Reset DS structures
      this.studentList      = new LinkedList();
      this.studentHashTable = new HashTable<StudentNode>(53);
      this.studentBST       = new BST();
      this.scholarshipHeap  = new MaxHeap();
      this.memoryAllocator  = new FirstFitAllocator();

      students.forEach(s => {
        this.studentList.append(s);
        this.studentHashTable.set(s.id, s);
        this.studentBST.insert({ rollNumber: s.id, name: s.name, gpa: s.gpa });
        this.scholarshipHeap.insert({ id: s.id, name: s.name, marks: s.gpa * 25 });
        this.memoryAllocator.allocate(s.id, s.name, 50);
      });

      // Load other tables into memory cache
      this.attendance    = await api.getAllAttendance();
      this.academicScores = await api.getAllScores();
      this.leaveRequests = await api.getLeaves();
      this.systemLogs    = await api.getLogs(50);

    } catch (err) {
      console.error('loadAll failed — is XAMPP running?', err);
    }
  }

  // ============================================================
  // STUDENTS
  // ============================================================

  // Returns all students from in-memory list (fast, no network call)
  getAllStudents(): StudentNode[] {
    return this.studentList.toArray();
  }

  // Returns one student from in-memory hash table (fast)
  getStudent(id: string): StudentNode | undefined {
    return this.studentHashTable.get(id).value;
  }

  searchStudentWithProbes(id: string) {
    return this.studentHashTable.get(id);
  }

  // Saves to MySQL AND updates in-memory DS
  async addStudent(
    id: string, name: string, email: string,
    phone: string, year: 'final' | 'junior' = 'junior'
  ) {
    if (this.studentHashTable.get(id).value) return null; // already exists

    const enrollment = new Date().toISOString().split('T')[0];
    const student: StudentNode = { id, name, email, phone, gpa: 0, enrollment, year };

    await api.addStudent(student);

    // Update in-memory structures
    this.studentList.append(student);
    this.studentHashTable.set(id, student);
    this.studentBST.insert({ rollNumber: id, name, gpa: 0 });
    this.scholarshipHeap.insert({ id, name, marks: 0 });
    this.memoryAllocator.allocate(id, name, 50);

    return student;
  }

  async deleteStudent(id: string) {
    await api.deleteStudent(id);

    // Update in-memory structures
    this.studentList.delete(id);
    this.studentHashTable.delete(id);
    this.memoryAllocator.deallocate(id);
  }

  async updateStudent(id: string, updates: Partial<StudentNode>) {
    await api.updateStudent({ id, ...updates });

    // Update in-memory structures
    this.studentList.update(id, updates);
    const student = this.studentList.find(id);
    if (student) this.studentHashTable.set(id, student);
  }

  // ============================================================
  // ATTENDANCE
  // ============================================================

  async addAttendance(
    studentId: string, date: string,
    status: 'Present' | 'Absent', subject: string
  ) {
    const result = await api.addAttendance({ studentId, date, status, subject });
    // Add to local cache so pages don't need a full reload
    this.attendance.push({ id: result.id, studentId, date, status, subject });
  }

  // Returns from in-memory cache (no network call needed)
  getStudentAttendance(studentId: string): AttendanceRecord[] {
    return this.attendance.filter(a => a.studentId === studentId);
  }

  calculateAttendancePercentage(studentId: string): number {
    const records = this.getStudentAttendance(studentId);
    if (records.length === 0) return 0;
    return (records.filter(r => r.status === 'Present').length / records.length) * 100;
  }

  getLowAttendanceStudents(): StudentNode[] {
    return this.getAllStudents().filter(
      s => this.calculateAttendancePercentage(s.id) < 75
    );
  }

  // ============================================================
  // ACADEMIC SCORES
  // ============================================================

  async addScore(studentId: string, scoreType: string, value: number) {
    const result = await api.addScore({ studentId, scoreType, value });
    this.academicScores.push({ id: result.id, studentId, scoreType, value });

    // Update GPA in in-memory structures (PHP already updated MySQL)
    if (result.updatedGpa !== undefined) {
      this.studentList.update(studentId, { gpa: result.updatedGpa });
      const student = this.studentList.find(studentId);
      if (student) {
        this.studentHashTable.set(studentId, student);
        this.studentBST.insert({ rollNumber: studentId, name: student.name, gpa: result.updatedGpa });
      }
    }
  }

  // Returns from in-memory cache
  getStudentScores(studentId: string): AcademicScore[] {
    return this.academicScores.filter(s => s.studentId === studentId);
  }

  getToppers(k = 5): HeapStudent[] {
    return this.scholarshipHeap.getSorted().slice(0, k);
  }

  // ============================================================
  // LEAVE REQUESTS
  // ============================================================

  async submitLeaveRequest(studentId: string, reason: string, leaveType: string) {
    const result = await api.submitLeave({ studentId, reason, leaveType });
    this.leaveRequests.push(result);
    return result;
  }

  // Returns from in-memory cache sorted by priority
  getLeaveRequests(): LeaveRequest[] {
    return [...this.leaveRequests].sort((a, b) => b.priority - a.priority);
  }

  async updateLeaveStatus(id: number, status: string) {
    await api.updateLeaveStatus(id, status);
    const req = this.leaveRequests.find(l => l.id === id);
    if (req) req.status = status;
  }

  // ============================================================
  // DOCUMENTS
  // ============================================================

  async addDocument(studentId: string, name: string, type: string) {
    const result = await api.addDocument({ studentId, name, type });
    this.documents.push(result);
    return result;
  }

  // Returns from in-memory cache
  getStudentDocuments(studentId: string): Document[] {
    return this.documents.filter(d => d.studentId === studentId);
  }

  // ============================================================
  // SYSTEM LOGS
  // ============================================================

  async addLog(action: string, user?: string) {
    await api.addLog(action, user);
    this.systemLogs.unshift({
      timestamp: new Date().toLocaleString(), action, user
    });
  }

  // Returns from in-memory cache
  getRecentLogs(count = 20): SystemLog[] {
    return this.systemLogs.slice(0, count);
  }

  async clearLogs() {
    await api.clearLogs();
    this.systemLogs = [];
  }
}

export const db = new EduTrackDatabase();