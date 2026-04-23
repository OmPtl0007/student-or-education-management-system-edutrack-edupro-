import { useState } from 'react';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AddStudentPage() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState<'final' | 'junior'>('junior');
  const [loading, setLoading] = useState(false); // ← NEW: show loading state

  // ↓ CHANGED: handler is now async because db.addStudent() hits MySQL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (db.getStudent(id)) {
      toast.error('Student ID already exists!');
      return;
    }
    setLoading(true);
    try {
      await db.addStudent(id, name, email, phone, year); // ← await
      await db.addLog(`Student '${name}' (${id}) added`);  // ← await
      toast.success(`Student ${name} added successfully!`);
      setId(''); setName(''); setEmail(''); setPhone('');
    } catch {
      toast.error('Failed to save — is XAMPP running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Add New Student</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Student Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Student ID</label>
              <Input value={id} onChange={e => setId(e.target.value)} placeholder="e.g. S006" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@edu.com" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9876543210" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Year</label>
              <Select value={year} onValueChange={(v: any) => setYear(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="final">Final Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* ↓ CHANGED: button shows "Saving..." while waiting for MySQL */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Add Student'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}