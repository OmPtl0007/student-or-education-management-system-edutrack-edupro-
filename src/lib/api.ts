// ============================================================
// api.ts — All calls to your PHP backend (XAMPP)
// Every function talks to http://localhost/edutrack-api/
// ============================================================

const BASE = 'http://localhost/edutrack-api';

// ---------- helper: POST / PUT / DELETE with JSON body ----------
async function request(url: string, method: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ================================================================
// STUDENTS
// ================================================================
export const api = {

  // GET all students → StudentNode[]
  getStudents: () =>
    fetch(`${BASE}/students.php`).then(r => r.json()),

  // GET one student by id → StudentNode | null
  getStudent: (id: string) =>
    fetch(`${BASE}/students.php?id=${id}`).then(r => r.json()),

  // POST → add new student
  addStudent: (data: {
    id: string; name: string; email: string;
    phone: string; gpa: number; enrollment: string; year: string;
  }) => request(`${BASE}/students.php`, 'POST', data),

  // PUT → update student fields
  updateStudent: (data: {
    id: string; name?: string; email?: string;
    phone?: string; gpa?: number; year?: string;
  }) => request(`${BASE}/students.php`, 'PUT', data),

  // DELETE → remove student by id
  deleteStudent: (id: string) =>
    fetch(`${BASE}/students.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.json()),

  // ================================================================
  // ATTENDANCE
  // ================================================================

  // GET all attendance records for a student
  getAttendance: (studentId: string) =>
    fetch(`${BASE}/attendance.php?student_id=${encodeURIComponent(studentId)}`).then(r => r.json()),

  // GET all attendance (no filter)
  getAllAttendance: () =>
    fetch(`${BASE}/attendance.php`).then(r => r.json()),

  // POST → record attendance
  addAttendance: (data: {
    studentId: string; date: string;
    status: 'Present' | 'Absent'; subject: string;
  }) => request(`${BASE}/attendance.php`, 'POST', data),

  // DELETE → remove one attendance record by id
  deleteAttendance: (id: number) =>
    fetch(`${BASE}/attendance.php?id=${id}`, { method: 'DELETE' }).then(r => r.json()),

  // ================================================================
  // ACADEMIC SCORES
  // ================================================================

  // GET all scores for a student
  getScores: (studentId: string) =>
    fetch(`${BASE}/scores.php?student_id=${encodeURIComponent(studentId)}`).then(r => r.json()),

  // GET all scores (no filter)
  getAllScores: () =>
    fetch(`${BASE}/scores.php`).then(r => r.json()),

  // POST → add score (also auto-updates GPA in MySQL via scores.php)
  addScore: (data: {
    studentId: string; scoreType: string; value: number;
  }) => request(`${BASE}/scores.php`, 'POST', data),

  // DELETE → remove a score record
  deleteScore: (id: number) =>
    fetch(`${BASE}/scores.php?id=${id}`, { method: 'DELETE' }).then(r => r.json()),

  // ================================================================
  // LEAVE REQUESTS
  // ================================================================

  // GET all leave requests (sorted by priority in PHP)
  getLeaves: () =>
    fetch(`${BASE}/leaves.php`).then(r => r.json()),

  // GET leave requests for one student
  getStudentLeaves: (studentId: string) =>
    fetch(`${BASE}/leaves.php?student_id=${encodeURIComponent(studentId)}`).then(r => r.json()),

  // POST → submit a leave request
  submitLeave: (data: {
    studentId: string; reason: string; leaveType: string; date?: string;
  }) => request(`${BASE}/leaves.php`, 'POST', data),

  // PUT → update leave status (Approved / Rejected)
  updateLeaveStatus: (id: number, status: string) =>
    request(`${BASE}/leaves.php`, 'PUT', { id, status }),

  // DELETE → remove a leave request
  deleteLeave: (id: number) =>
    fetch(`${BASE}/leaves.php?id=${id}`, { method: 'DELETE' }).then(r => r.json()),

  // ================================================================
  // DOCUMENTS
  // ================================================================

  // GET documents for one student
  getDocuments: (studentId: string) =>
    fetch(`${BASE}/documents.php?student_id=${encodeURIComponent(studentId)}`).then(r => r.json()),

  // POST → add a document record
  addDocument: (data: {
    studentId: string; name: string; type: string; date?: string;
  }) => request(`${BASE}/documents.php`, 'POST', data),

  // DELETE → remove a document record
  deleteDocument: (id: number) =>
    fetch(`${BASE}/documents.php?id=${id}`, { method: 'DELETE' }).then(r => r.json()),

  // ================================================================
  // SYSTEM LOGS
  // ================================================================

  // GET recent logs (default 20, pass count to get more)
  getLogs: (count = 20) =>
    fetch(`${BASE}/logs.php?count=${count}`).then(r => r.json()),

  // POST → write a log entry
  addLog: (action: string, user?: string) =>
    request(`${BASE}/logs.php`, 'POST', { action, user }),

  // DELETE → clear ALL logs
  clearLogs: () =>
    fetch(`${BASE}/logs.php`, { method: 'DELETE' }).then(r => r.json()),
};