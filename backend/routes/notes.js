/**
 * routes/notes.js
 * ---------------
 * Defines all API endpoints and connects each one to its controller
 * function. Kept intentionally simple and readable.
 */

const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");

// Stats for the dashboard cards
router.get("/stats", notesController.getStats);

// Recently viewed notes (Queue)
router.get("/recent", notesController.getRecentNotes);

// Undo the last delete (Stack)
router.post("/undo", notesController.undoDelete);

// Mark a note as opened (adds it to the Queue)
router.post("/notes/:id/open", notesController.openNote);

// Standard CRUD routes (HashMap + Trie under the hood)
router.get("/notes", notesController.getAllNotes);
router.get("/notes/:id", notesController.getNoteById);
router.post("/notes", notesController.createNote);
router.put("/notes/:id", notesController.updateNote);
router.delete("/notes/:id", notesController.deleteNote);

module.exports = router;
