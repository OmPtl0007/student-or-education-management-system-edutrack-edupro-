import { useState } from 'react';
import { db } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function AddScorePage() {
  const [studentId, setStudentId] = useState('');
  const [scoreType, setScoreType] = useState('internal');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db.getStudent(studentId)) { toast.error('Student not found!'); return; }
    const v = parseFloat(value);
    if (v < 0 || v > 100) { toast.error('Score must be 0-100!'); return; }
    db.addScore(studentId, scoreType, v);
    db.addLog(`Score added for ${studentId}: ${scoreType} = ${v}`);
    toast.success('Score added!');
    setStudentId(''); setValue('');
  };

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Add Academic Score</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Student ID</label>
              <Input value={studentId} onChange={e => setStudentId(e.target.value)} required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Score Type</label>
              <Select value={scoreType} onValueChange={setScoreType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="final">Final Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Score (0-100)</label>
              <Input type="number" min={0} max={100} value={value} onChange={e => setValue(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Add Score</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function ViewAcademicsPage() {
  const { user, isStudent } = useAuth();
  const [studentId, setStudentId] = useState(isStudent ? user?.studentId || '' : '');
  const [data, setData] = useState<any>(null);

  const handleView = () => {
    const student = db.getStudent(studentId.trim());
    if (!student) { setData(null); return; }
    const scores = db.getStudentScores(studentId);
    const grouped: Record<string, number[]> = {};
    scores.forEach(s => {
      if (!grouped[s.scoreType]) grouped[s.scoreType] = [];
      grouped[s.scoreType].push(s.value);
    });
    setData({ student, grouped });
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">View Academics</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID" disabled={isStudent} />
            <Button onClick={handleView}>View</Button>
          </div>
          {data && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{data.student.name}</h3>
                  <p className="text-sm text-muted-foreground">{data.student.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{data.student.gpa.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">GPA</p>
                </div>
              </div>
              {Object.entries(data.grouped).map(([type, vals]: any) => (
                <div key={type} className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{type}</Badge>
                  <span className="text-sm">{vals.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TopPerformersPage() {
  const [k, setK] = useState('5');
  const [toppers, setToppers] = useState<any[]>([]);

  const generate = () => {
    const t = db.getToppers(parseInt(k));
    setToppers(t);
    db.addLog(`Top ${k} performers report generated`);
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Top Performers (Max-Heap)</h1>
      <div className="flex gap-2 mb-4">
        <Input type="number" min={1} max={20} value={k} onChange={e => setK(e.target.value)} className="w-24" />
        <Button onClick={generate}>Generate</Button>
      </div>
      {toppers.length > 0 && (
        <div className="space-y-2">
          {toppers.map((s, i) => (
            <Card key={s.id} className={i === 0 ? 'border-accent/50 bg-accent/5' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-muted-foreground w-8">#{i + 1}</span>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{(s.marks / 25).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">GPA (marks: {s.marks.toFixed(0)})</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScholarshipHeapPage() {
  const heap = db.scholarshipHeap;
  const top = heap.peek();
  const sorted = heap.getSorted();

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Scholarship List (Max-Heap)</h1>
      {top && (
        <Card className="mb-4 border-accent/50 bg-accent/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Heap Root — #1 Scholar</p>
              <p className="text-xl font-bold mt-1">{top.name}</p>
              <p className="text-sm text-muted-foreground">{top.id}</p>
            </div>
            <div className="text-3xl font-bold text-accent">{top.marks.toFixed(0)}</div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="text-lg">All Students (Sorted by Marks)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sorted.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.id}</p>
                </div>
              </div>
              <span className="font-semibold">{s.marks.toFixed(0)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
