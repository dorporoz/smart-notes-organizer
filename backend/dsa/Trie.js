/**
 * Trie.js
 * -------
 * A real Trie (prefix tree) implementation used for instant
 * prefix-based search of notes (e.g. typing "ja" finds
 * "Java Notes" and "Java Assignment").
 *
 * WE DO NOT USE Array.filter() FOR SEARCHING.
 * Every character of every word is inserted into a tree of nodes.
 * Searching a prefix means walking down the tree character by
 * character, which is why lookups only cost O(k) where k = length
 * of the prefix, no matter how many notes exist.
 *
 * TIME COMPLEXITY:
 *   insert(word)      -> O(m)  where m = length of the word
 *   startsWith(prefix) -> O(k) to walk the prefix + O(r) to collect
 *                          results, where r = number of matching ids
 *
 * SPACE COMPLEXITY: O(ALPHABET_SIZE * N * M) worst case,
 * where N = number of words inserted, M = average word length.
 */

class TrieNode {
  constructor() {
    // Each key is a single character, each value is another TrieNode.
    this.children = {};

    // Every note id whose word passes through this node.
    // Storing this at every node (not just the end) is what makes
    // prefix search return results instantly.
    this.noteIds = new Set();

    // Marks the end of a complete inserted word.
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert a single word and associate it with a note id.
  insert(word, noteId) {
    if (!word) return;
    const normalized = word.toLowerCase();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
      // Record that this note passes through this prefix node.
      current.noteIds.add(noteId);
    }

    current.isEndOfWord = true;
  }

  // Walk down the tree following the prefix's characters.
  // Returns the TrieNode at the end of the prefix, or null if the
  // prefix does not exist in the tree.
  _findNode(prefix) {
    let current = this.root;
    const normalized = prefix.toLowerCase();

    for (const char of normalized) {
      if (!current.children[char]) {
        return null;
      }
      current = current.children[char];
    }

    return current;
  }

  // Returns true if any inserted word starts with this prefix.
  startsWith(prefix) {
    return this._findNode(prefix) !== null;
  }

  // Returns an array of all note ids whose title contains a word
  // that starts with the given prefix.
  search(prefix) {
    if (!prefix) return [];
    const node = this._findNode(prefix);
    if (!node) return [];
    return Array.from(node.noteIds);
  }
}

module.exports = Trie;
