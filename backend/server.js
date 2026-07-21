/**
 * server.js
 * ---------
 * Entry point for the Smart Notes Organizer backend.
 * Sets up Express, middleware, and mounts our API routes.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const notesRoutes = require("./routes/notes");

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors()); // Allow the frontend (different origin) to call this API
app.use(express.json()); // Parse incoming JSON request bodies

// ---------- Routes ----------
app.use("/api", notesRoutes);

// Simple health check endpoint, useful when deploying to Render
app.get("/", (req, res) => {
  res.json({
    message: "Smart Notes Organizer API is running",
    endpoints: [
      "GET  /api/notes",
      "GET  /api/notes/:id",
      "POST /api/notes",
      "PUT  /api/notes/:id",
      "DELETE /api/notes/:id",
      "POST /api/undo",
      "POST /api/notes/:id/open",
      "GET  /api/recent",
      "GET  /api/stats",
    ],
  });
});

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`Smart Notes Organizer backend running on http://localhost:${PORT}`);
});
