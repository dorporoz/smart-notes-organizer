/**
 * HashMap.js
 * ----------
 * Custom wrapper around JavaScript's built-in Map object.
 *
 * WHY WE USE IT:
 * Notes need to be inserted, looked up, updated, and deleted by their
 * unique "id" very quickly. A JavaScript Map gives us average O(1)
 * time complexity for all of these operations because it is
 * implemented internally using a hash table.
 *
 * TIME COMPLEXITY:
 *   set(key, value) -> O(1) average
 *   get(key)        -> O(1) average
 *   delete(key)      -> O(1) average
 *   has(key)         -> O(1) average
 *
 * SPACE COMPLEXITY: O(n) where n = number of notes stored
 */

class HashMap {
  constructor() {
    // The internal data structure doing the real work.
    this.map = new Map();
  }

  // Insert or update a note. Key = note id, Value = note object.
  set(key, value) {
    this.map.set(key, value);
    return value;
  }

  // Retrieve a note by id. Returns undefined if not found.
  get(key) {
    return this.map.get(key);
  }

  // Remove a note by id. Returns true if it existed and was removed.
  delete(key) {
    return this.map.delete(key);
  }

  // Check whether a note with this id exists.
  has(key) {
    return this.map.has(key);
  }

  // Get all stored notes as a plain array.
  values() {
    return Array.from(this.map.values());
  }

  // Number of notes currently stored.
  size() {
    return this.map.size;
  }

  // Remove everything (used when reloading from disk).
  clear() {
    this.map.clear();
  }
}

module.exports = HashMap;
