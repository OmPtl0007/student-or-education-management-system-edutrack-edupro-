import { useState } from 'react';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserMinus } from 'lucide-react';

export default function RegistrationQueuePage() {
  const [studentId, setStudentId] = useState('');
  const [queue, setQueue] = useState(db.registrationQueue.toArray());

  const handleEnqueue = () => {
    const student = db.getStudent(studentId.trim());
    if (!student) {
      return;
    }
    db.registrationQueue.enqueue({
      studentId: student.id,
      name: student.name,
      timestamp: new Date().toLocaleString(),
    });
    db.save();
    setQueue(db.registrationQueue.toArray());
    db.addLog(`${student.name} added to registration queue`);
    setStudentId('');
  };

  const handleDequeue = () => {
    const item = db.registrationQueue.dequeue();
    if (item) {
      db.save();
      setQueue(db.registrationQueue.toArray());
      db.addLog(`${item.name} processed from registration queue`);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in space-y-4">
      <h1 className="text-2xl font-bold">Registration Queue (FIFO)</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Add to Queue</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID (e.g. S001)" />
          <Button onClick={handleEnqueue}><UserPlus className="h-4 w-4 mr-1" /> Enqueue</Button>
          <Button variant="secondary" onClick={handleDequeue} disabled={queue.length === 0}>
            <UserMinus className="h-4 w-4 mr-1" /> Dequeue
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Queue</CardTitle>
            <Badge variant="secondary">{queue.length} in line</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Queue is empty</p>
          ) : (
            <div className="space-y-2">
              {queue.map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${i === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.studentId}</p>
                  </div>
                  <div className="text-right">
                    {i === 0 && <Badge className="bg-primary text-primary-foreground">FRONT</Badge>}
                    <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
