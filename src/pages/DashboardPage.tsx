import { db } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, Trophy, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user, isStudent, canViewAllStudents } = useAuth();
  const students = db.getAllStudents();
  const linkedStudent = isStudent && user?.studentId ? db.getStudent(user.studentId) : null;

  const totalStudents = students.length;
  const avgAttendance = students.length > 0
    ? students.reduce((sum, s) => sum + db.calculateAttendancePercentage(s.id), 0) / students.length
    : 0;
  const topGPA = students.length > 0 ? Math.max(...students.map(s => s.gpa)) : 0;
  const pendingLeaves = db.getLeaveRequests().filter(l => l.status === 'Pending').length;

  if (isStudent && linkedStudent) {
    const myAttendance = db.calculateAttendancePercentage(linkedStudent.id);
    const myScores = db.getStudentScores(linkedStudent.id);
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Welcome, {linkedStudent.name}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-6 h-6 text-primary" />} label="Student ID" value={linkedStudent.id} />
          <StatCard icon={<ClipboardList className="w-6 h-6 text-success" />} label="Attendance" value={`${myAttendance.toFixed(1)}%`} />
          <StatCard icon={<Trophy className="w-6 h-6 text-accent" />} label="GPA" value={linkedStudent.gpa.toFixed(2)} />
          <StatCard icon={<FileText className="w-6 h-6 text-info" />} label="Scores" value={String(myScores.length)} />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Your Info</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{linkedStudent.email}</span></div>
              <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{linkedStudent.phone}</span></div>
              <div><span className="text-muted-foreground">Enrolled:</span> <span className="font-medium">{linkedStudent.enrollment}</span></div>
              <div><span className="text-muted-foreground">Year:</span> <span className="font-medium capitalize">{linkedStudent.year || 'N/A'}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-6 h-6 text-primary" />} label="Total Students" value={String(totalStudents)} />
        <StatCard icon={<ClipboardList className="w-6 h-6 text-success" />} label="Avg Attendance" value={`${avgAttendance.toFixed(1)}%`} />
        <StatCard icon={<Trophy className="w-6 h-6 text-accent" />} label="Top GPA" value={topGPA.toFixed(2)} />
        <StatCard icon={<FileText className="w-6 h-6 text-destructive" />} label="Pending Leaves" value={String(pendingLeaves)} />
      </div>
      {canViewAllStudents && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Students</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.slice(-5).reverse().map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.id}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{s.gpa.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-muted">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
