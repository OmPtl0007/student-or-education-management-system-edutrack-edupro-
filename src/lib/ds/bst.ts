// Binary Search Tree for Roll Number ordering
export interface BSTData {
  rollNumber: string;
  name: string;
  gpa: number;
}

class BSTNode {
  data: BSTData;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  constructor(data: BSTData) {
    this.data = data;
  }
}

export class BST {
  root: BSTNode | null = null;

  insert(data: BSTData) {
    const node = new BSTNode(data);
    if (!this.root) {
      this.root = node;
      return;
    }
    let curr = this.root;
    while (true) {
      if (data.rollNumber < curr.data.rollNumber) {
        if (!curr.left) { curr.left = node; return; }
        curr = curr.left;
      } else if (data.rollNumber > curr.data.rollNumber) {
        if (!curr.right) { curr.right = node; return; }
        curr = curr.right;
      } else {
        // duplicate, update
        curr.data = data;
        return;
      }
    }
  }

  // Inorder traversal - returns sorted by roll number
  inorder(): BSTData[] {
    const result: BSTData[] = [];
    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.data);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  search(rollNumber: string): BSTData | null {
    let curr = this.root;
    while (curr) {
      if (rollNumber === curr.data.rollNumber) return curr.data;
      curr = rollNumber < curr.data.rollNumber ? curr.left : curr.right;
    }
    return null;
  }

  // Get tree structure for visualization
  getStructure(): any {
    const build = (node: BSTNode | null): any => {
      if (!node) return null;
      return {
        data: node.data,
        left: build(node.left),
        right: build(node.right),
      };
    };
    return build(this.root);
  }
}
