import { useState } from 'react';
import { db } from '@/lib/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState(db.getRecentLogs());

  // ↓ CHANGED: async — db.clearLogs() calls DELETE on logs.php
  const clearLogs = async () => {
    if (confirm('Clear all logs?')) {
      try {
        await db.clearLogs(); // ← await
        setLogs([]);
        toast.success('Logs cleared');
      } catch {
        toast.error('Failed to clear logs — is XAMPP running?');
      }
    }
  };

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <Button variant="destructive" size="sm" onClick={clearLogs}>Clear Logs</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No logs available</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{log.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}