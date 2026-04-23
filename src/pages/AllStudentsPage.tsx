import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { bubbleSort, selectionSort, SortKey, SortOrder } from '@/lib/ds/sorting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2 } from 'lucide-react';

export default function AllStudentsPage() {
  const { canModifyStudents } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortAlgo, setSortAlgo] = useState<'bubble' | 'selection'>('bubble');
  const [sortInfo, setSortInfo] = useState<{ comparisons: number; swaps: number } | null>(null);
  const [students, setStudents] = useState(db.getAllStudents());

  useEffect(() => {
    setStudents(db.getAllStudents());
    const interval = setInterval(() => {
      const s = db.getAllStudents();
      if (s.length > 0) {
        setStudents(s);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleSort = () => {
    const fn = sortAlgo === 'bubble' ? bubbleSort : selectionSort;
    const result = fn(db.getAllStudents(), sortKey, sortOrder);
    setStudents(result.sorted);
    setSortInfo({ comparisons: result.comparisons, swaps: result.swaps });
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Delete student ${id}?`)) {
      try {
        await db.deleteStudent(id);
        await db.addLog(`Student ${id} deleted`);
        setStudents(db.getAllStudents());
      } catch {
        alert('Delete failed — is XAMPP running?');
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Student Directory</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-base">Sort Students</CardTitle>
            <Select value={sortAlgo} onValueChange={(v: any) => setSortAlgo(v)}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bubble">Bubble Sort</SelectItem>
                <SelectItem value="selection">Selection Sort</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(v: any) => setSortKey(v)}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="gpa">GPA</SelectItem>
                <SelectItem value="id">ID</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSort} size="sm">Sort</Button>
            {sortInfo && (
              <Badge variant="secondary" className="font-mono text-xs">
                {sortAlgo === 'bubble' ? 'Bubble' : 'Selection'}: {sortInfo.comparisons} comparisons, {sortInfo.swaps} swaps
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students found. Add students first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Enrolled</TableHead>
                  {canModifyStudents && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold font-mono">{s.id}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                    <TableCell className="font-semibold">{parseFloat(String(s.gpa)).toFixed(2)}</TableCell>
                    <TableCell>{s.enrollment}</TableCell>
                    {canModifyStudents && (
                      <TableCell>
                        <Button
                          variant="ghost" size="icon"
                          className="text-destructive h-8 w-8"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}