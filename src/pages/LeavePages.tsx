import { useState } from 'react';
import { db } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function SubmitLeavePage() {
  const { user, isStudent } = useAuth();
  const [studentId, setStudentId] = useState(isStudent ? user?.studentId || '' : '');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('casual');
  const [loading, setLoading] = useState(false); // ← NEW

  // ↓ CHANGED: async — db.submitLeaveRequest() saves to MySQL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db.getStudent(studentId)) { toast.error('Student not found!'); return; }
    setLoading(true);
    try {
      await db.submitLeaveRequest(studentId, reason, leaveType); // ← await
      await db.addLog(`Leave request submitted by ${studentId}`); // ← await
      toast.success('Leave request submitted!');
      setReason('');
    } catch {
      toast.error('Failed to submit — is XAMPP running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Submit Leave Request</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Student ID</label>
              <Input value={studentId} onChange={e => setStudentId(e.target.value)} disabled={isStudent} required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Leave Type</label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Reason</label>
              <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leave" required /></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Leave'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ViewLeavesPage — reads from in-memory cache, no network changes
export function ViewLeavesPage() {
  const { user, isStudent } = useAuth();
  const leaves = db.getLeaveRequests().filter(l =>
    isStudent ? l.studentId === user?.studentId : true
  );
  const priorityLabels: Record<number, string> = { 3: '🔴 Medical', 2: '🟡 Academic', 1: '🟢 Casual' };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Pending Leaves (Priority Queue)</h1>
      {leaves.length === 0 ? (
        <p className="text-muted-foreground">No leave requests</p>
      ) : (
        <div className="space-y-2">
          {leaves.map(leave => {
            const student = db.getStudent(leave.studentId);
            return (
              <Card key={leave.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{student?.name || leave.studentId}</p>
                      <p className="text-xs text-muted-foreground">{leave.studentId} — {priorityLabels[leave.priority]}</p>
                      <p className="text-sm text-muted-foreground mt-2">{leave.reason}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{leave.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{leave.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}