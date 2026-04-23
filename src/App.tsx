import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { db } from "@/lib/database";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AllStudentsPage from "@/pages/AllStudentsPage";
import AddStudentPage from "@/pages/AddStudentPage";
import SearchStudentPage from "@/pages/SearchStudentPage";
import RegistrationQueuePage from "@/pages/RegistrationQueuePage";
import { RecordAttendancePage, ViewAttendancePage, LowAttendancePage } from "@/pages/AttendancePages";
import { AddScorePage, ViewAcademicsPage, TopPerformersPage, ScholarshipHeapPage } from "@/pages/AcademicPages";
import { SubmitLeavePage, ViewLeavesPage } from "@/pages/LeavePages";
import { AddDocumentPage, ViewDocumentsPage } from "@/pages/DocumentPages";
import { ReportCardsPage, MemoryAllocationPage, BSTViewPage } from "@/pages/SystemPages";
import SystemLogsPage from "@/pages/SystemLogsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute roles={['admin', 'teacher']}><AllStudentsPage /></ProtectedRoute>} />
      <Route path="/students/add" element={<ProtectedRoute roles={['admin']}><AddStudentPage /></ProtectedRoute>} />
      <Route path="/students/search" element={<ProtectedRoute roles={['admin', 'teacher']}><SearchStudentPage /></ProtectedRoute>} />
      <Route path="/registration" element={<ProtectedRoute roles={['admin', 'teacher']}><RegistrationQueuePage /></ProtectedRoute>} />
      <Route path="/attendance/record" element={<ProtectedRoute roles={['admin', 'teacher']}><RecordAttendancePage /></ProtectedRoute>} />
      <Route path="/attendance/view" element={<ProtectedRoute><ViewAttendancePage /></ProtectedRoute>} />
      <Route path="/attendance/low" element={<ProtectedRoute roles={['admin', 'teacher']}><LowAttendancePage /></ProtectedRoute>} />
      <Route path="/academics/add" element={<ProtectedRoute roles={['admin', 'teacher']}><AddScorePage /></ProtectedRoute>} />
      <Route path="/academics/view" element={<ProtectedRoute><ViewAcademicsPage /></ProtectedRoute>} />
      <Route path="/academics/toppers" element={<ProtectedRoute><TopPerformersPage /></ProtectedRoute>} />
      <Route path="/academics/scholarship" element={<ProtectedRoute roles={['admin', 'teacher']}><ScholarshipHeapPage /></ProtectedRoute>} />
      <Route path="/leaves/submit" element={<ProtectedRoute><SubmitLeavePage /></ProtectedRoute>} />
      <Route path="/leaves/view" element={<ProtectedRoute><ViewLeavesPage /></ProtectedRoute>} />
      <Route path="/documents/add" element={<ProtectedRoute><AddDocumentPage /></ProtectedRoute>} />
      <Route path="/documents/view" element={<ProtectedRoute><ViewDocumentsPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin', 'teacher']}><ReportCardsPage /></ProtectedRoute>} />
      <Route path="/memory" element={<ProtectedRoute roles={['admin']}><MemoryAllocationPage /></ProtectedRoute>} />
      <Route path="/bst" element={<ProtectedRoute roles={['admin', 'teacher']}><BSTViewPage /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute roles={['admin']}><SystemLogsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    db.loadAll().catch(() => {
      console.warn("Could not connect to MySQL. Check XAMPP is running.");
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;