import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Card>
        <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Theme</label>
            <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">☀️ Light</SelectItem>
                <SelectItem value="dark">🌙 Dark</SelectItem>
                <SelectItem value="auto">🖥️ System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader><CardTitle className="text-lg">Account Info</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <div><span className="text-muted-foreground">Username:</span> <span className="font-medium capitalize">{user?.username}</span></div>
          <div><span className="text-muted-foreground">Role:</span> <span className="font-medium capitalize">{user?.role}</span></div>
          {user?.studentId && <div><span className="text-muted-foreground">Student ID:</span> <span className="font-medium">{user.studentId}</span></div>}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader><CardTitle className="text-lg">DS & Algorithms Used</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <p>• <span className="text-foreground font-medium">Singly Linked List</span> — Student storage</p>
          <p>• <span className="text-foreground font-medium">Simple Queue</span> — Registration desk (FIFO)</p>
          <p>• <span className="text-foreground font-medium">Bubble/Selection Sort</span> — Sort by marks/name</p>
          <p>• <span className="text-foreground font-medium">Hash Table (Linear Probing)</span> — Student ID search</p>
          <p>• <span className="text-foreground font-medium">Binary Search Tree</span> — Roll number ordering + Inorder traversal</p>
          <p>• <span className="text-foreground font-medium">Max-Heap</span> — Scholarship list</p>
          <p>• <span className="text-foreground font-medium">Priority Scheduling</span> — Report card generation</p>
          <p>• <span className="text-foreground font-medium">First Fit Algorithm</span> — Memory allocation simulation</p>
        </CardContent>
      </Card>
    </div>
  );
}
