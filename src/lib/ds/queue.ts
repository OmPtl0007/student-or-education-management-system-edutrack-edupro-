// Simple Queue for Registration Desk
export interface QueueItem {
  studentId: string;
  name: string;
  timestamp: string;
}

export class SimpleQueue {
  private items: QueueItem[] = [];

  enqueue(item: QueueItem) {
    this.items.push(item);
  }

  dequeue(): QueueItem | undefined {
    return this.items.shift();
  }

  peek(): QueueItem | undefined {
    return this.items[0];
  }

  get size() { return this.items.length; }
  get isEmpty() { return this.items.length === 0; }

  toArray(): QueueItem[] {
    return [...this.items];
  }

  fromArray(arr: QueueItem[]) {
    this.items = [...arr];
  }
}
