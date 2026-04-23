import { useState } from 'react';
import { db } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function RecordAttendancePage() {
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false); // ← NEW

  // ↓ CHANGED: async — db.addAttendance() saves to MySQL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db.getStudent(studentId)) { toast.error('Student not found!'); return; }
    setLoading(true);
    try {
      await db.addAttendance(studentId, date, status, subject); // ← await
      await db.addLog(`Attendance recorded for ${studentId}: ${status}`); // ← await
      toast.success('Attendance recorded!');
      setStudentId(''); setSubject('');
    } catch {
      toast.error('Failed to save — is XAMPP running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Record Attendance</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Student ID</label>
              <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="S001" required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Subject</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Python" required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Record Attendance'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ViewAttendancePage — reads from in-memory cache, no changes needed
export function ViewAttendancePage() {
  const { user, isStudent } = useAuth();
  const [studentId, setStudentId] = useState(isStudent ? user?.studentId || '' : '');
  const [records, setRecords] = useState<any[]>([]);
  const [percentage, setPercentage] = useState<number | null>(null);

  const handleView = () => {
    if (!studentId.trim()) return;
    if (!db.getStudent(studentId)) { setRecords([]); setPercentage(null); return; }
    setRecords(db.getStudentAttendance(studentId));
    setPercentage(db.calculateAttendancePercentage(studentId));
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">View Attendance</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID" disabled={isStudent} />
            <Button onClick={handleView}>View</Button>
          </div>
          {percentage !== null && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Attendance: {percentage.toFixed(1)}%</span>
              <Badge className={percentage >= 75 ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                {percentage >= 75 ? '✅ Good' : '⚠️ Low'}
              </Badge>
            </div>
          )}
          {records.length > 0 && (
            <div className="space-y-2">
              {records.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{r.subject}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <Badge className={r.status === 'Present' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// LowAttendancePage — reads from in-memory cache, only addLog needs await
export function LowAttendancePage() {
  const [report, setReport] = useState<any[]>([]);

  // ↓ CHANGED: async for db.addLog()
  const generate = async () => {
    const low = db.getLowAttendanceStudents().sort((a, b) =>
      db.calculateAttendancePercentage(a.id) - db.calculateAttendancePercentage(b.id)
    );
    setReport(low);
    await db.addLog('Low attendance report generated'); // ← await
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Low Attendance Report</h1>
      <Button onClick={generate} className="mb-4">Generate Report</Button>
      {report.length === 0 ? (
        <p className="text-success font-medium">✅ All students have attendance ≥ 75%</p>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-lg">{report.length} students below 75%</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {report.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                <div>
                  <p className="font-medium text-sm">{i + 1}. {s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.id}</p>
                </div>
                <span className="font-semibold text-destructive">{db.calculateAttendancePercentage(s.id).toFixed(1)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}