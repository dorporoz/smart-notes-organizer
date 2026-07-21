/**
 * noteService.js
 * --------------
 * This is the "brain" of the application. It connects our custom
 * Data Structures (HashMap, Trie, Stack, Queue) to a simple JSON
 * file used as our database.
 *
 * Every time a note is added, edited, deleted, or opened, this file
 * records WHICH data structure operation just happened, so the
 * frontend "DSA Operations" panel can display it.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HashMap = require("../dsa/HashMap");
const Trie = require("../dsa/Trie");
const Stack = require("../dsa/Stack");
const Queue = require("../dsa/Queue");

const DATA_FILE = path.join(__dirname, "..", "data", "notes.json");

class NoteService {
  constructor() {
    // 1. HashMap -> primary storage for O(1) access by id
    this.notesMap = new HashMap();

    // 2. Trie -> powers instant prefix search over note titles
    this.trie = new Trie();

    // 3. Stack -> stores deleted notes so they can be undone
    this.deletedStack = new Stack();

    // 4. Queue -> stores up to 10 most recently viewed note ids
    this.recentQueue = new Queue(10);

    // Keeps a friendly log of the last DSA operation performed,
    // used by the "DSA Operations" panel on the frontend.
    this.lastOperation = null;

    this._loadFromDisk();
  }

  // ---------- Persistence helpers ----------

  _loadFromDisk() {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const notes = JSON.parse(raw || "[]");
      this.notesMap.clear();
      notes.forEach((note) => this.notesMap.set(note.id, note));
      this._rebuildTrie();
    } catch (err) {
      // If the file doesn't exist yet, start with an empty notebook.
      this.notesMap.clear();
      this._saveToDisk();
    }
  }

  _saveToDisk() {
    const notes = this.notesMap.values();
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), "utf-8");
  }

  // Rebuilds the Trie index from scratch based on current notes.
  // We rebuild instead of trying to delete individual words because
  // Trie deletion is complex; rebuilding is simple, correct, and fast
  // enough for a notes app with a reasonable number of notes.
  _rebuildTrie() {
    this.trie = new Trie();
    this.notesMap.values().forEach((note) => {
      const words = note.title.split(/\s+/);
      words.forEach((word) => this.trie.insert(word, note.id));
    });
  }

  _setOperation(structure, action, complexity) {
    this.lastOperation = {
      structure,
      action,
      complexity,
      timestamp: new Date().toISOString(),
    };
  }

  // ---------- Public API used by the controller ----------

  getAllNotes() {
    return this.notesMap
      .values()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getNoteById(id) {
    const note = this.notesMap.get(id);
    this._setOperation("HashMap", "Get", "O(1)");
    return note;
  }

  createNote({ title, content, category }) {
    const now = new Date().toISOString();
    const note = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content ? content.trim() : "",
      category: category || "Other",
      createdAt: now,
      updatedAt: now,
    };

    this.notesMap.set(note.id, note);
    this._setOperation("HashMap", "Insert", "O(1)");
    this._rebuildTrie();
    this._saveToDisk();
    return note;
  }

  updateNote(id, { title, content, category }) {
    const note = this.notesMap.get(id);
    if (!note) return null;

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (category !== undefined) note.category = category;
    note.updatedAt = new Date().toISOString();

    this.notesMap.set(id, note);
    this._setOperation("HashMap", "Update", "O(1)");
    this._rebuildTrie();
    this._saveToDisk();
    return note;
  }

  deleteNote(id) {
    const note = this.notesMap.get(id);
    if (!note) return null;

    this.notesMap.delete(id);
    this.deletedStack.push(note);
    this._setOperation("Stack", "Push", "O(1)");
    this._rebuildTrie();
    this._saveToDisk();
    return note;
  }

  undoDelete() {
    const note = this.deletedStack.pop();
    this._setOperation("Stack", "Pop", "O(1)");
    if (!note) return null;

    this.notesMap.set(note.id, note);
    this._rebuildTrie();
    this._saveToDisk();
    return note;
  }

  openNote(id) {
    const note = this.notesMap.get(id);
    if (!note) return null;

    this.recentQueue.enqueue(id);
    this._setOperation("Queue", "Enqueue", "O(1)");
    return note;
  }

  getRecentNotes() {
    this._setOperation("Queue", "Display", "O(n)");
    const ids = this.recentQueue.toArray();
    return ids
      .map((id) => this.notesMap.get(id))
      .filter((note) => note !== undefined);
  }

  searchNotes(prefix) {
    this._setOperation("Trie", "Search", "O(k)");
    if (!prefix) return this.getAllNotes();

    const matchingIds = this.trie.search(prefix);
    const idSet = new Set(matchingIds);
    return this.notesMap
      .values()
      .filter((note) => idSet.has(note.id))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getStats() {
    const notes = this.notesMap.values();
    const categories = new Set(notes.map((n) => n.category));

    return {
      totalNotes: this.notesMap.size(),
      totalCategories: categories.size,
      recentlyViewed: this.recentQueue.size(),
      deletedStackSize: this.deletedStack.size(),
    };
  }

  getLastOperation() {
    return this.lastOperation;
  }
}

// Export a single shared instance so the whole app uses the same
// in-memory data structures (a simple singleton pattern).
module.exports = new NoteService();
