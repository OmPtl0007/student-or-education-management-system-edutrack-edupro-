// Hash Table with Linear Probing for student ID lookup
export class HashTable<T> {
  private table: ({ key: string; value: T } | null)[];
  private capacity: number;
  private _size = 0;

  constructor(capacity = 53) {
    this.capacity = capacity;
    this.table = new Array(capacity).fill(null);
  }

  private hash(key: string): number {
    let total = 0;
    const PRIME = 31;
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      total = (total * PRIME + key.charCodeAt(i)) % this.capacity;
    }
    return total;
  }

  set(key: string, value: T) {
    let idx = this.hash(key);
    let probes = 0;
    while (probes < this.capacity) {
      if (!this.table[idx] || this.table[idx]!.key === key) {
        if (!this.table[idx]) this._size++;
        this.table[idx] = { key, value };
        return { index: idx, probes };
      }
      idx = (idx + 1) % this.capacity; // linear probing
      probes++;
    }
    return null; // table full
  }

  get(key: string): { value: T | null; index: number; probes: number } {
    let idx = this.hash(key);
    let probes = 0;
    while (probes < this.capacity) {
      if (!this.table[idx]) return { value: null, index: -1, probes };
      if (this.table[idx]!.key === key) return { value: this.table[idx]!.value, index: idx, probes };
      idx = (idx + 1) % this.capacity;
      probes++;
    }
    return { value: null, index: -1, probes };
  }

  delete(key: string): boolean {
    let idx = this.hash(key);
    let probes = 0;
    while (probes < this.capacity) {
      if (!this.table[idx]) return false;
      if (this.table[idx]!.key === key) {
        this.table[idx] = null;
        this._size--;
        // Rehash subsequent entries
        let next = (idx + 1) % this.capacity;
        while (this.table[next]) {
          const entry = this.table[next]!;
          this.table[next] = null;
          this._size--;
          this.set(entry.key, entry.value);
          next = (next + 1) % this.capacity;
        }
        return true;
      }
      idx = (idx + 1) % this.capacity;
      probes++;
    }
    return false;
  }

  get size() { return this._size; }

  getTableSnapshot(): ({ key: string; value: T } | null)[] {
    return [...this.table];
  }

  getAllEntries(): { key: string; value: T }[] {
    return this.table.filter(Boolean) as { key: string; value: T }[];
  }
}
