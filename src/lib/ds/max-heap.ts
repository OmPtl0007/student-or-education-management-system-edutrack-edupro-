// Max-Heap for Scholarship List (highest marks at top)
export interface HeapStudent {
  id: string;
  name: string;
  marks: number;
}

export class MaxHeap {
  private heap: HeapStudent[] = [];

  get size() { return this.heap.length; }

  private parentIdx(i: number) { return Math.floor((i - 1) / 2); }
  private leftIdx(i: number) { return 2 * i + 1; }
  private rightIdx(i: number) { return 2 * i + 2; }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  insert(student: HeapStudent) {
    this.heap.push(student);
    this.bubbleUp(this.heap.length - 1);
  }

  private bubbleUp(idx: number) {
    while (idx > 0) {
      const parent = this.parentIdx(idx);
      if (this.heap[parent].marks < this.heap[idx].marks) {
        this.swap(parent, idx);
        idx = parent;
      } else break;
    }
  }

  extractMax(): HeapStudent | null {
    if (this.heap.length === 0) return null;
    const max = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return max;
  }

  private sinkDown(idx: number) {
    const length = this.heap.length;
    while (true) {
      let largest = idx;
      const left = this.leftIdx(idx);
      const right = this.rightIdx(idx);
      if (left < length && this.heap[left].marks > this.heap[largest].marks) largest = left;
      if (right < length && this.heap[right].marks > this.heap[largest].marks) largest = right;
      if (largest === idx) break;
      this.swap(idx, largest);
      idx = largest;
    }
  }

  peek(): HeapStudent | null {
    return this.heap[0] || null;
  }

  toArray(): HeapStudent[] {
    return [...this.heap];
  }

  // Get sorted (descending) without modifying heap
  getSorted(): HeapStudent[] {
    const copy = new MaxHeap();
    this.heap.forEach(s => copy.insert({ ...s }));
    const sorted: HeapStudent[] = [];
    while (copy.size > 0) {
      sorted.push(copy.extractMax()!);
    }
    return sorted;
  }

  fromArray(arr: HeapStudent[]) {
    this.heap = [];
    arr.forEach(s => this.insert(s));
  }
}
