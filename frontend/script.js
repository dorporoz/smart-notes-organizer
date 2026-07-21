/**
 * script.js
 * ---------
 * All frontend logic for Smart Notes Organizer.
 * Talks to the Express backend, which is where the real
 * Data Structure work (HashMap, Trie, Stack, Queue) happens.
 * This file is responsible only for rendering the UI and
 * reacting to user actions.
 */

// Change this if your backend runs somewhere else (e.g. after
// deploying to Render, point this at your Render URL).
const API_URL = "https://smart-notes-organizer-t2rw.onrender.com";

// ---------- App state ----------
let currentCategory = "All";
let currentSearch = "";
let editingNoteId = null;

// ---------- Element references ----------
const notesGrid = document.getElementById("notesGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const categoryList = document.getElementById("categoryList");
const recentList = document.getElementById("recentList");
const dsaPanel = document.getElementById("dsaPanel");

const statTotal = document.getElementById("statTotal");
const statCategories = document.getElementById("statCategories");
const statRecent = document.getElementById("statRecent");
const statDeleted = document.getElementById("statDeleted");

const addNoteBtn = document.getElementById("addNoteBtn");
const undoBtn = document.getElementById("undoBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const cancelBtn = document.getElementById("cancelBtn");
const noteForm = document.getElementById("noteForm");
const noteIdInput = document.getElementById("noteId");
const noteTitleInput = document.getElementById("noteTitle");
const noteCategoryInput = document.getElementById("noteCategory");
const noteContentInput = document.getElementById("noteContent");

const viewOverlay = document.getElementById("viewOverlay");
const viewTitle = document.getElementById("viewTitle");
const viewCategory = document.getElementById("viewCategory");
const viewDates = document.getElementById("viewDates");
const viewContent = document.getElementById("viewContent");
const viewClose = document.getElementById("viewClose");

const toast = document.getElementById("toast");

// ---------- API helpers ----------

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  // Whenever the backend tells us which DSA operation just ran,
  // reflect it in the DSA Operations panel.
  if (data.lastOperation) {
    renderDsaOperation(data.lastOperation);
  }

  return data;
}

// ---------- Rendering ----------

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderNotes(notes) {
  notesGrid.innerHTML = "";

  if (notes.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  notes.forEach((note) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.innerHTML = `
      <div class="note-card__header">
        <h3 class="note-card__title"></h3>
        <span class="badge"></span>
      </div>
      <p class="note-card__date"></p>
      <p class="note-card__preview"></p>
      <div class="note-card__actions">
        <button class="btn btn--ghost btn--small" data-action="open">Open</button>
        <button class="btn btn--ghost btn--small" data-action="edit">Edit</button>
        <button class="btn btn--danger btn--small" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector(".note-card__title").textContent = note.title;
    card.querySelector(".badge").textContent = note.category;
    card.querySelector(".note-card__date").textContent =
      "Created " + formatDate(note.createdAt);
    card.querySelector(".note-card__preview").textContent =
      note.content || "No additional content.";

    card
      .querySelector('[data-action="open"]')
      .addEventListener("click", () => openNote(note.id));
    card
      .querySelector('[data-action="edit"]')
      .addEventListener("click", () => openEditModal(note));
    card
      .querySelector('[data-action="delete"]')
      .addEventListener("click", () => deleteNote(note.id));

    notesGrid.appendChild(card);
  });
}

function renderStats(stats) {
  statTotal.textContent = stats.totalNotes;
  statCategories.textContent = stats.totalCategories;
  statRecent.textContent = stats.recentlyViewed;
  statDeleted.textContent = stats.deletedStackSize;
}

function renderRecentList(notes) {
  recentList.innerHTML = "";

  if (notes.length === 0) {
    recentList.innerHTML = '<li class="recent-empty">Nothing viewed yet</li>';
    return;
  }

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.textContent = note.title;
    li.title = note.title;
    li.addEventListener("click", () => openNote(note.id));
    recentList.appendChild(li);
  });
}

// Updates the "DSA Operations" panel to show the most recent
// data-structure operation performed by the backend.
function renderDsaOperation(operation) {
  dsaPanel.innerHTML = `
    <div class="dsa-panel__row">
      <span class="dsa-panel__structure">${operation.structure}</span>
      <span class="dsa-panel__action">${operation.action}</span>
      <span class="dsa-panel__complexity">Time complexity: ${operation.complexity}</span>
    </div>
  `;
}

// ---------- Data loading ----------

async function loadNotes() {
  let path = "/notes?";
  const params = new URLSearchParams();
  if (currentSearch) params.set("search", currentSearch);
  if (currentCategory && currentCategory !== "All")
    params.set("category", currentCategory);

  const data = await apiRequest(`/notes?${params.toString()}`);
  renderNotes(data.notes);
}

async function loadStats() {
  const data = await apiRequest("/stats");
  renderStats(data.stats);
}

async function loadRecent() {
  const data = await apiRequest("/recent");
  renderRecentList(data.notes);
}

async function refreshEverything() {
  await Promise.all([loadNotes(), loadStats(), loadRecent()]);
}

// ---------- Actions ----------

async function openNote(id) {
  try {
    const data = await apiRequest(`/notes/${id}/open`, { method: "POST" });
    const note = data.note;

    viewTitle.textContent = note.title;
    viewCategory.textContent = note.category;
    viewDates.textContent = `Created ${formatDate(
      note.createdAt
    )} · Updated ${formatDate(note.updatedAt)}`;
    viewContent.textContent = note.content || "No additional content.";
    viewOverlay.hidden = false;

    await Promise.all([loadStats(), loadRecent()]);
  } catch (err) {
    showToast(err.message);
  }
}

async function deleteNote(id) {
  const confirmed = confirm("Delete this note? You can undo this afterward.");
  if (!confirmed) return;

  try {
    await apiRequest(`/notes/${id}`, { method: "DELETE" });
    showToast("Note deleted. Click Undo to restore it.");
    await refreshEverything();
  } catch (err) {
    showToast(err.message);
  }
}

async function undoLastDelete() {
  try {
    const data = await apiRequest("/undo", { method: "POST" });
    showToast(`Restored "${data.note.title}"`);
    await refreshEverything();
  } catch (err) {
    showToast(err.message);
  }
}

async function saveNote(event) {
  event.preventDefault();

  const payload = {
    title: noteTitleInput.value,
    content: noteContentInput.value,
    category: noteCategoryInput.value,
  };

  try {
    if (editingNoteId) {
      await apiRequest(`/notes/${editingNoteId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showToast("Note updated");
    } else {
      await apiRequest("/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Note added");
    }

    closeModal();
    await refreshEverything();
  } catch (err) {
    showToast(err.message);
  }
}

// ---------- Modal handling ----------

function openAddModal() {
  editingNoteId = null;
  modalTitle.textContent = "Add Note";
  noteIdInput.value = "";
  noteTitleInput.value = "";
  noteCategoryInput.value = "Study";
  noteContentInput.value = "";
  modalOverlay.hidden = false;
  noteTitleInput.focus();
}

function openEditModal(note) {
  editingNoteId = note.id;
  modalTitle.textContent = "Edit Note";
  noteIdInput.value = note.id;
  noteTitleInput.value = note.title;
  noteCategoryInput.value = note.category;
  noteContentInput.value = note.content;
  modalOverlay.hidden = false;
  noteTitleInput.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  editingNoteId = null;
  noteForm.reset();
}

function closeViewModal() {
  viewOverlay.hidden = true;
}

// ---------- Toast ----------

let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  toastTimeout = setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => (toast.hidden = true), 200);
  }, 2500);
}

// ---------- Search (debounced, powered by backend Trie) ----------

let searchDebounce;
function handleSearchInput(event) {
  clearTimeout(searchDebounce);
  const value = event.target.value.trim();

  searchDebounce = setTimeout(() => {
    currentSearch = value;
    loadNotes();
  }, 200);
}

// ---------- Category filter ----------

function handleCategoryClick(event) {
  const item = event.target.closest(".category-item");
  if (!item) return;

  document
    .querySelectorAll(".category-item")
    .forEach((el) => el.classList.remove("category-item--active"));
  item.classList.add("category-item--active");

  currentCategory = item.dataset.category;
  loadNotes();
}

// ---------- Event listeners ----------

addNoteBtn.addEventListener("click", openAddModal);
undoBtn.addEventListener("click", undoLastDelete);
modalClose.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
noteForm.addEventListener("submit", saveNote);
viewClose.addEventListener("click", closeViewModal);
searchInput.addEventListener("input", handleSearchInput);
categoryList.addEventListener("click", handleCategoryClick);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
viewOverlay.addEventListener("click", (e) => {
  if (e.target === viewOverlay) closeViewModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeViewModal();
  }
});

// ---------- Initial load ----------

refreshEverything().catch((err) => {
  showToast("Could not reach the backend. Is it running on port 5000?");
  console.error(err);
});
