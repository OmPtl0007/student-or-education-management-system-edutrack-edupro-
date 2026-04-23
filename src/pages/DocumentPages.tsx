import { useState } from 'react';
import { db } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function AddDocumentPage() {
  const { user, isStudent } = useAuth();
  const [studentId, setStudentId] = useState(isStudent ? user?.studentId || '' : '');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('certificate');
  const [loading, setLoading] = useState(false); // ← NEW

  // ↓ CHANGED: async — db.addDocument() saves to MySQL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db.getStudent(studentId)) { toast.error('Student not found!'); return; }
    setLoading(true);
    try {
      await db.addDocument(studentId, docName, docType); // ← await
      await db.addLog(`Document added for ${studentId}: ${docName}`); // ← await
      toast.success('Document added!');
      setDocName('');
    } catch {
      toast.error('Failed to save — is XAMPP running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Add Document</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Student ID</label>
              <Input value={studentId} onChange={e => setStudentId(e.target.value)} disabled={isStudent} required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Document Name</label>
              <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Marksheet" required /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Document Type</label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="marksheet">Marksheet</SelectItem>
                  <SelectItem value="id_card">ID Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Add Document'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ViewDocumentsPage — reads from in-memory cache, only addLog needs await
export function ViewDocumentsPage() {
  const { user, isStudent } = useAuth();
  const [studentId, setStudentId] = useState(isStudent ? user?.studentId || '' : '');
  const [docs, setDocs] = useState<any[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // ↓ CHANGED: async for db.addLog()
  const handleView = async (dir: 'forward' | 'backward') => {
    if (!studentId.trim()) return;
    let d = db.getStudentDocuments(studentId);
    if (dir === 'backward') d = [...d].reverse();
    setDocs(d);
    setDirection(dir);
    await db.addLog(`Viewed documents for ${studentId} (${dir})`); // ← await
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">View Documents (Linked List Traversal)</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID" disabled={isStudent} />
            <Button onClick={() => handleView('forward')}>➡️ Forward</Button>
            <Button variant="secondary" onClick={() => handleView('backward')}>⬅️ Backward</Button>
          </div>
          {docs.length > 0 && (
            <div>
              <Badge variant="secondary" className="mb-3">Direction: {direction === 'forward' ? '➡️ Forward' : '⬅️ Backward'}</Badge>
              <div className="space-y-2">
                {docs.map((doc, i) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{i + 1}. {doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date}</p>
                    </div>
                    <Badge variant="outline">{doc.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}