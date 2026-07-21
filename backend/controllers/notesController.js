/**
 * notesController.js
 * -------------------
 * Handles incoming HTTP requests, talks to noteService (which owns
 * all the Data Structure logic), and sends back JSON responses.
 */

const noteService = require("../services/noteService");

// GET /notes  OR  GET /notes?search=prefix&category=Study
function getAllNotes(req, res) {
  const { search, category } = req.query;

  let notes;
  if (search) {
    notes = noteService.searchNotes(search);
  } else {
    notes = noteService.getAllNotes();
  }

  if (category && category !== "All") {
    notes = notes.filter((note) => note.category === category);
  }

  res.json({
    notes,
    lastOperation: noteService.getLastOperation(),
  });
}

// GET /notes/:id
function getNoteById(req, res) {
  const note = noteService.getNoteById(req.params.id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json({ note, lastOperation: noteService.getLastOperation() });
}

// POST /notes
function createNote(req, res) {
  const { title, content, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const note = noteService.createNote({ title, content, category });
  res.status(201).json({ note, lastOperation: noteService.getLastOperation() });
}

// PUT /notes/:id
function updateNote(req, res) {
  const { title, content, category } = req.body;

  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  const note = noteService.updateNote(req.params.id, { title, content, category });
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json({ note, lastOperation: noteService.getLastOperation() });
}

// DELETE /notes/:id
function deleteNote(req, res) {
  const note = noteService.deleteNote(req.params.id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json({ note, lastOperation: noteService.getLastOperation() });
}

// POST /undo
function undoDelete(req, res) {
  const note = noteService.undoDelete();
  if (!note) {
    return res.status(400).json({ error: "Nothing to undo" });
  }
  res.json({ note, lastOperation: noteService.getLastOperation() });
}

// POST /notes/:id/open
function openNote(req, res) {
  const note = noteService.openNote(req.params.id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json({ note, lastOperation: noteService.getLastOperation() });
}

// GET /recent
function getRecentNotes(req, res) {
  const notes = noteService.getRecentNotes();
  res.json({ notes, lastOperation: noteService.getLastOperation() });
}

// GET /stats
function getStats(req, res) {
  res.json({ stats: noteService.getStats() });
}

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  undoDelete,
  openNote,
  getRecentNotes,
  getStats,
};
