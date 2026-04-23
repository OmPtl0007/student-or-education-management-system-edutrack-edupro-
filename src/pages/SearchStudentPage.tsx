import { useState } from 'react';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function SearchStudentPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [probes, setProbes] = useState<number | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    const res = db.searchStudentWithProbes(query.trim());
    setResult(res.value);
    setProbes(res.probes);
  };

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Search Student (Hash Table)</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Search by Student ID</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter Student ID (e.g. S001)"
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <Button onClick={handleSearch}><Search className="h-4 w-4 mr-1" /> Search</Button>
          </div>
          {probes !== null && (
            <Badge variant="secondary" className="font-mono">
              Hash Table lookup: {probes} probe(s) (Linear Probing)
            </Badge>
          )}
          {result ? (
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h3 className="font-semibold text-lg">{result.name}</h3>
              <p className="text-sm text-muted-foreground">{result.id}</p>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {result.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {result.phone}</div>
                <div><span className="text-muted-foreground">GPA:</span> <span className="font-semibold">{result.gpa.toFixed(2)}</span></div>
                <div><span className="text-muted-foreground">Attendance:</span> {db.calculateAttendancePercentage(result.id).toFixed(1)}%</div>
              </div>
            </div>
          ) : probes !== null ? (
            <p className="text-center text-destructive font-medium">❌ Student not found</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
