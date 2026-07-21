/**
 * Queue.js
 * --------
 * A custom Queue implementation (FIFO - First In, First Out) built
 * from scratch on top of a plain JavaScript array.
 *
 * WHY WE USE IT:
 * The "Recently Viewed Notes" feature must remember the order notes
 * were opened in, and automatically forget the oldest one once more
 * than 10 notes have been viewed. A queue models this perfectly:
 * new notes are enqueued at the back, and once the queue is full,
 * the oldest note (at the front) is dequeued automatically.
 *
 * TIME COMPLEXITY:
 *   enqueue() -> O(1) amortized
 *   dequeue() -> O(n) (shifting the front element) - acceptable here
 *                because the queue is capped at 10 items.
 *
 * SPACE COMPLEXITY: O(1) extra space, bounded by maxSize.
 */

class Queue {
  constructor(maxSize = 10) {
    this.items = [];
    this.maxSize = maxSize;
  }

  // Add a newly viewed note id to the back of the queue.
  // If a note is already in the queue, move it to the back instead
  // of creating a duplicate entry.
  enqueue(item) {
    const existingIndex = this.items.indexOf(item);
    if (existingIndex !== -1) {
      this.items.splice(existingIndex, 1);
    }

    this.items.push(item);

    // Enforce the maximum size by removing the oldest (front) item.
    if (this.items.length > this.maxSize) {
      this.dequeue();
    }
  }

  // Remove and return the oldest item (front of the queue).
  dequeue() {
    if (this.isEmpty()) return undefined;
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  // Return items with the most recently viewed first (for display).
  toArray() {
    return [...this.items].reverse();
  }
}

module.exports = Queue;
