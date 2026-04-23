// Priority Scheduling for report card generation
// Final Year students processed first, then Juniors

export interface ScheduleTask {
  studentId: string;
  name: string;
  year: 'final' | 'junior';
  priority: number; // higher = processed first
  status: 'waiting' | 'processing' | 'done';
}

export class PriorityScheduler {
  private queue: ScheduleTask[] = [];

  addTask(task: Omit<ScheduleTask, 'priority' | 'status'>) {
    const priority = task.year === 'final' ? 2 : 1;
    this.queue.push({ ...task, priority, status: 'waiting' });
    // Sort by priority (descending)
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  processNext(): ScheduleTask | null {
    const task = this.queue.find(t => t.status === 'waiting');
    if (task) {
      task.status = 'processing';
      return task;
    }
    return null;
  }

  completeTask(studentId: string) {
    const task = this.queue.find(t => t.studentId === studentId);
    if (task) task.status = 'done';
  }

  processAll(): ScheduleTask[] {
    const order: ScheduleTask[] = [];
    let task: ScheduleTask | null;
    while ((task = this.processNext())) {
      task.status = 'done';
      order.push({ ...task });
    }
    return order;
  }

  getQueue(): ScheduleTask[] {
    return [...this.queue];
  }

  reset() {
    this.queue.forEach(t => t.status = 'waiting');
  }

  clear() {
    this.queue = [];
  }
}
