import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  username: string;
  role: UserRole;
  studentId?: string; // linked student ID for student role
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  canModifyStudents: boolean;
  canViewAllStudents: boolean;
  canRecordAttendance: boolean;
  canViewLogs: boolean;
}

const validUsers: Record<string, { password: string; role: UserRole; studentId?: string }> = {
  admin: { password: '12345', role: 'admin' },
  teacher: { password: 'password', role: 'teacher' },
  alice: { password: 'student123', role: 'student', studentId: 'S001' },
  bob: { password: 'student123', role: 'student', studentId: 'S002' },
  carol: { password: 'student123', role: 'student', studentId: 'S003' },
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('edutrack_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const login = (username: string, password: string) => {
    const entry = validUsers[username.toLowerCase()];
    if (!entry || entry.password !== password) {
      return { success: false, error: 'Invalid username or password' };
    }
    const u: User = { username: username.toLowerCase(), role: entry.role, studentId: entry.studentId };
    setUser(u);
    localStorage.setItem('edutrack_user', JSON.stringify(u));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edutrack_user');
  };

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      isAdmin, isTeacher, isStudent,
      canModifyStudents: isAdmin,
      canViewAllStudents: isAdmin || isTeacher,
      canRecordAttendance: isAdmin || isTeacher,
      canViewLogs: isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
