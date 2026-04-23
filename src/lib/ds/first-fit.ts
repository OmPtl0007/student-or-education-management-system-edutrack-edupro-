// First Fit Memory Allocation algorithm
// Simulates finding free slots in an array/memory block

export interface MemoryBlock {
  id: number;
  size: number;
  allocated: boolean;
  studentId: string | null;
  studentName: string | null;
}

export class FirstFitAllocator {
  blocks: MemoryBlock[];

  constructor(blockSizes: number[] = [100, 200, 50, 300, 150, 80, 250, 120]) {
    this.blocks = blockSizes.map((size, i) => ({
      id: i,
      size,
      allocated: false,
      studentId: null,
      studentName: null,
    }));
  }

  allocate(studentId: string, studentName: string, requiredSize: number): { blockId: number; success: boolean } {
    // First Fit: find the FIRST block that fits
    for (const block of this.blocks) {
      if (!block.allocated && block.size >= requiredSize) {
        block.allocated = true;
        block.studentId = studentId;
        block.studentName = studentName;
        return { blockId: block.id, success: true };
      }
    }
    return { blockId: -1, success: false };
  }

  deallocate(studentId: string): boolean {
    const block = this.blocks.find(b => b.studentId === studentId);
    if (block) {
      block.allocated = false;
      block.studentId = null;
      block.studentName = null;
      return true;
    }
    return false;
  }

  getBlocks(): MemoryBlock[] {
    return [...this.blocks];
  }

  getUsage(): { total: number; used: number; free: number } {
    const total = this.blocks.reduce((sum, b) => sum + b.size, 0);
    const used = this.blocks.filter(b => b.allocated).reduce((sum, b) => sum + b.size, 0);
    return { total, used, free: total - used };
  }

  reset() {
    this.blocks.forEach(b => {
      b.allocated = false;
      b.studentId = null;
      b.studentName = null;
    });
  }

  fromSnapshot(blocks: MemoryBlock[]) {
    this.blocks = blocks.map(b => ({ ...b }));
  }
}
