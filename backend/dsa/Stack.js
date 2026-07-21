/**
 * Stack.js
 * --------
 * A custom Stack implementation (LIFO - Last In, First Out) built
 * from scratch on top of a plain JavaScript array.
 *
 * WHY WE USE IT:
 * The "Undo Delete" feature needs to bring back the MOST RECENTLY
 * deleted note first. A stack is the natural fit: every deleted
 * note is pushed on top, and undo simply pops the top note off.
 *
 * TIME COMPLEXITY:
 *   push() -> O(1)
 *   pop()  -> O(1)
 *   peek() -> O(1)
 *
 * SPACE COMPLEXITY: O(n) where n = number of deleted notes waiting
 * to be undone.
 */

class Stack {
  constructor() {
    this.items = [];
  }

  // Add a deleted note to the top of the stack.
  push(item) {
    this.items.push(item);
  }

  // Remove and return the most recently deleted note.
  // Returns undefined if the stack is empty.
  pop() {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }

  // Look at the top item without removing it.
  peek() {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  // Return items as an array (top of stack first) for display
  // in the "Deleted Stack Size" statistic / debugging.
  toArray() {
    return [...this.items].reverse();
  }
}

module.exports = Stack;
