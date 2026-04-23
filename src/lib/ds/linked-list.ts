// Singly Linked List for storing students
export interface StudentNode {
  id: string;
  name: string;
  email: string;
  phone: string;
  gpa: number;
  enrollment: string;
  year?: 'final' | 'junior'; // for priority scheduling
}

class LLNode {
  data: StudentNode;
  next: LLNode | null = null;
  constructor(data: StudentNode) {
    this.data = data;
  }
}

export class LinkedList {
  head: LLNode | null = null;
  private _size = 0;

  get size() { return this._size; }

  append(data: StudentNode) {
    const node = new LLNode(data);
    if (!this.head) {
      this.head = node;
    } else {
      let curr = this.head;
      while (curr.next) curr = curr.next;
      curr.next = node;
    }
    this._size++;
  }

  find(id: string): StudentNode | null {
    let curr = this.head;
    while (curr) {
      if (curr.data.id === id) return curr.data;
      curr = curr.next;
    }
    return null;
  }

  update(id: string, updates: Partial<StudentNode>): boolean {
    let curr = this.head;
    while (curr) {
      if (curr.data.id === id) {
        Object.assign(curr.data, updates);
        return true;
      }
      curr = curr.next;
    }
    return false;
  }

  delete(id: string): boolean {
    if (!this.head) return false;
    if (this.head.data.id === id) {
      this.head = this.head.next;
      this._size--;
      return true;
    }
    let curr = this.head;
    while (curr.next) {
      if (curr.next.data.id === id) {
        curr.next = curr.next.next;
        this._size--;
        return true;
      }
      curr = curr.next;
    }
    return false;
  }

  toArray(): StudentNode[] {
    const arr: StudentNode[] = [];
    let curr = this.head;
    while (curr) {
      arr.push(curr.data);
      curr = curr.next;
    }
    return arr;
  }

  fromArray(arr: StudentNode[]) {
    this.head = null;
    this._size = 0;
    arr.forEach(s => this.append(s));
  }
}
