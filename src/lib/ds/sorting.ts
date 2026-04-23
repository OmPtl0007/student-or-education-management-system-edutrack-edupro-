// Bubble Sort and Selection Sort implementations
import { StudentNode } from './linked-list';

export type SortKey = 'name' | 'gpa' | 'id';
export type SortOrder = 'asc' | 'desc';

// Bubble Sort with step tracking
export function bubbleSort(
  arr: StudentNode[],
  key: SortKey = 'name',
  order: SortOrder = 'asc'
): { sorted: StudentNode[]; comparisons: number; swaps: number } {
  const result = [...arr];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < result.length - 1; i++) {
    for (let j = 0; j < result.length - i - 1; j++) {
      comparisons++;
      const a = key === 'gpa' ? result[j].gpa : result[j][key];
      const b = key === 'gpa' ? result[j + 1].gpa : result[j + 1][key];
      const shouldSwap = order === 'asc' ? a > b : a < b;
      if (shouldSwap) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swaps++;
      }
    }
  }
  return { sorted: result, comparisons, swaps };
}

// Selection Sort with step tracking
export function selectionSort(
  arr: StudentNode[],
  key: SortKey = 'name',
  order: SortOrder = 'asc'
): { sorted: StudentNode[]; comparisons: number; swaps: number } {
  const result = [...arr];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < result.length - 1; i++) {
    let targetIdx = i;
    for (let j = i + 1; j < result.length; j++) {
      comparisons++;
      const a = key === 'gpa' ? result[j].gpa : result[j][key];
      const b = key === 'gpa' ? result[targetIdx].gpa : result[targetIdx][key];
      const shouldUpdate = order === 'asc' ? a < b : a > b;
      if (shouldUpdate) targetIdx = j;
    }
    if (targetIdx !== i) {
      [result[i], result[targetIdx]] = [result[targetIdx], result[i]];
      swaps++;
    }
  }
  return { sorted: result, comparisons, swaps };
}
