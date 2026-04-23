import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { PriorityScheduler } from '@/lib/ds/priority-scheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ReportCardsPage() {
  const [order, setOrder] = useState<any[]>([]);

  const generate = async () => {
    const scheduler = new PriorityScheduler();
    db.getAllStudents().forEach(s => {
      scheduler.addTask({ studentId: s.id, name: s.name, year: s.year || 'junior' });
    });
    const processed = scheduler.processAll();
    setOrder(processed);
    await db.addLog('Report cards generated with priority scheduling');
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Report Card Generation (Priority Scheduling)</h1>
      <p className="text-sm text-muted-foreground mb-4">Final Year students are processed first, then Juniors.</p>
      <Button onClick={generate} className="mb-4">Generate Report Cards</Button>
      {order.length > 0 && (
        <div className="space-y-2">
          {order.map((task, i) => (
            <Card key={task.studentId} className={task.year === 'final' ? 'border-primary/30' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-8">#{i + 1}</span>
                  <div>
                    <p className="font-semibold text-sm">{task.name}</p>
                    <p className="text-xs text-muted-foreground">{task.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={task.year === 'final' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                    {task.year === 'final' ? 'Final Year (P=2)' : 'Junior (P=1)'}
                  </Badge>
                  <Badge className="bg-success text-success-foreground">✓ Done</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function MemoryAllocationPage() {
  const [blocks, setBlocks] = useState(db.memoryAllocator.getBlocks());
  const [usage, setUsage] = useState(db.memoryAllocator.getUsage());

  useEffect(() => {
    const interval = setInterval(() => {
      const b = db.memoryAllocator.getBlocks();
      if (b.length > 0) {
        setBlocks(b);
        setUsage(db.memoryAllocator.getUsage());
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const refresh = () => {
    setBlocks(db.memoryAllocator.getBlocks());
    setUsage(db.memoryAllocator.getUsage());
  };

  return (
    <div className="max-w-3xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Memory Allocation (First Fit Algorithm)</h1>
      <div className="flex gap-4 mb-4">
        <Badge variant="secondary">Total: {usage.total} units</Badge>
        <Badge className="bg-primary text-primary-foreground">Used: {usage.used} units</Badge>
        <Badge className="bg-success text-success-foreground">Free: {usage.free} units</Badge>
        <Button size="sm" variant="outline" onClick={refresh}>Refresh</Button>
      </div>
      {blocks.length === 0 ? (
        <p className="text-muted-foreground">No memory blocks yet. Add students first.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {blocks.map(block => (
            <Card key={block.id} className={block.allocated ? 'border-primary/30 bg-primary/5' : 'border-dashed'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold">Block #{block.id}</span>
                  <Badge className={block.allocated ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                    {block.allocated ? 'ALLOCATED' : 'FREE'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Size: {block.size} units</p>
                {block.allocated && (
                  <p className="text-sm mt-1">
                    <span className="text-muted-foreground">Student:</span>{' '}
                    <span className="font-medium">{block.studentName} ({block.studentId})</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function BSTViewPage() {
  const [sorted, setSorted] = useState(db.studentBST.inorder());

  useEffect(() => {
    setSorted(db.studentBST.inorder());
    const interval = setInterval(() => {
      const s = db.studentBST.inorder();
      if (s.length > 0) {
        setSorted(s);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">BST — Inorder Traversal (Roll Numbers)</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Students stored in a Binary Search Tree, displayed via Inorder Traversal (ascending by Roll Number).
      </p>
      {sorted.length === 0 ? (
        <p className="text-muted-foreground">No students in BST yet. Add students first.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((s, i) => (
            <Card key={s.rollNumber}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-muted-foreground w-8">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.rollNumber}</p>
                  </div>
                </div>
                <span className="font-semibold text-primary">{parseFloat(String(s.gpa)).toFixed(2)} GPA</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}