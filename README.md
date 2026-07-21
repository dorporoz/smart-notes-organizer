# Smart Notes Organizer

A full-stack notes application built for a **Data Structures and Algorithms (DSA)** university course. The app is a real, working notes manager on the surface — but underneath, every feature is powered by a hand-written Data Structure implementation instead of a shortcut like `Array.filter()` or a database engine.

This is a **DSA project first, and a web project second.**

---

## Project Overview

Smart Notes Organizer lets you create, edit, delete, search, and organize notes into categories. What makes it a DSA project is *how* each feature is implemented internally:

| Feature | Data Structure Used | Why |
|---|---|---|
| Store & retrieve notes by id | **HashMap** (`Map`) | O(1) average insert/lookup/delete |
| Prefix search ("Ja" → Java Notes, Java Assignment) | **Trie** | O(k) search regardless of how many notes exist |
| Undo Delete | **Stack** (LIFO) | Restores the *most recently* deleted note first |
| Recently Viewed Notes | **Queue** (FIFO, capped at 10) | Remembers view order, forgets the oldest automatically |

A live **"DSA Operations"** panel in the sidebar shows exactly which data structure and operation just ran (e.g. `HashMap → Insert → O(1)`), so you can watch the theory work in real time.

---

## Features

- Dashboard with live statistics (total notes, categories, recently viewed, deleted stack size)
- Add / Edit / Delete notes
- Undo Delete (Stack-powered)
- Open Note (adds it to the Recently Viewed Queue)
- Instant prefix search powered by a real Trie (no array filtering)
- Filter notes by category
- Recently Viewed list in the sidebar
- Responsive, Apple-inspired minimal UI
- DSA Operations panel showing live data-structure activity

---

## Technologies Used

**Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6) — no frameworks
**Backend:** Node.js, Express.js
**Database:** Local JSON file (`backend/data/notes.json`) — no MongoDB/SQL
**Version Control:** Git + GitHub
**Deployment:** Frontend → Vercel, Backend → Render

---

## Folder Structure

```
smart-notes-organizer/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── data/
│   │   └── notes.json
│   ├── routes/
│   │   └── notes.js
│   ├── controllers/
│   │   └── notesController.js
│   ├── services/
│   │   └── noteService.js
│   └── dsa/
│       ├── HashMap.js
│       ├── Trie.js
│       ├── Stack.js
│       └── Queue.js
│
├── README.md
├── .gitignore
└── .env.example
```

---

## Installation Steps

```bash
git clone https://github.com/<your-username>/smart-notes-organizer.git
cd smart-notes-organizer
```

---

## How to Run the Backend

```bash
cd backend
npm install
npm start
```

The API will start at **http://localhost:5000**. You should see:

```
Smart Notes Organizer backend running on http://localhost:5000
```

Optional: copy `.env.example` to `.env` in the `backend/` folder if you want to change the port.

---

## How to Run the Frontend

The frontend is plain HTML/CSS/JS, so you can either:

**Option A — Open directly**
Double-click `frontend/index.html` to open it in your browser.

**Option B — Serve locally (recommended, avoids CORS quirks)**

```bash
cd frontend
python3 -m http.server 8080
```

Then visit **http://localhost:8080**.

> Make sure the backend is running first — the frontend calls `http://localhost:5000/api` (see the `API_BASE_URL` constant at the top of `script.js`).

---

## Deploy to Render (Backend)

1. Push this project to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your GitHub repo and select it.
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add an environment variable `PORT` if prompted (Render sets this automatically for you).
6. Deploy. Render will give you a live URL like `https://smart-notes-api.onrender.com`.

---

## Deploy to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repo.
3. Set the **Root Directory** to `frontend`.
4. Framework preset: **Other** (static site, no build step needed).
5. Before deploying, update `API_BASE_URL` in `script.js` to your Render backend URL.
6. Deploy.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes (supports `?search=` and `?category=`) |
| GET | `/api/notes/:id` | Get a single note by id |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update an existing note |
| DELETE | `/api/notes/:id` | Delete a note (pushes it to the undo Stack) |
| POST | `/api/undo` | Undo the last delete (pops the Stack) |
| POST | `/api/notes/:id/open` | Mark a note as opened (enqueues it in the Recently Viewed Queue) |
| GET | `/api/recent` | Get the Recently Viewed notes (Queue contents) |
| GET | `/api/stats` | Get dashboard statistics |

---

## DSA Concepts Used

### 1. HashMap
Implemented in `dsa/HashMap.js` as a thin wrapper around JavaScript's built-in `Map`. Used as the single source of truth for all notes, keyed by their unique `id`.

### 2. Trie
Implemented from scratch in `dsa/Trie.js`. Every word from every note's title is inserted character-by-character into the tree. Each tree node stores the set of note ids that pass through it, so a prefix search just walks down the tree following the typed characters and reads off the matching ids — no scanning of every note.

### 3. Stack
Implemented from scratch in `dsa/Stack.js` using a plain array with `push`/`pop`. Deleted notes are pushed on top; Undo pops the most recent one off.

### 4. Queue
Implemented from scratch in `dsa/Queue.js`. Opening a note enqueues its id at the back; once more than 10 notes have been viewed, the oldest one is dequeued automatically.

---

## Time Complexity

| Operation | Structure | Complexity |
|---|---|---|
| Add note | HashMap | O(1) average |
| Get note by id | HashMap | O(1) average |
| Update note | HashMap | O(1) average |
| Delete note | HashMap + Stack push | O(1) average |
| Undo delete | Stack pop | O(1) |
| Prefix search | Trie | O(k), k = length of search prefix |
| Open note (view) | Queue enqueue | O(1) amortized |
| List recently viewed | Queue display | O(n), n ≤ 10 |

---

## Space Complexity

| Structure | Space |
|---|---|
| HashMap | O(n), n = number of notes |
| Trie | O(a × n × m) worst case, a = alphabet size, n = number of words, m = average word length |
| Stack | O(d), d = number of deleted (not-yet-restored) notes |
| Queue | O(1), capped at a fixed size of 10 |

---

## Future Improvements

- Add user authentication so multiple people can have separate note collections
- Support Trie-based search across note content, not just titles
- Add a Min-Heap to sort notes by "most edited" or priority
- Replace the JSON file with a lightweight embedded database (e.g. SQLite) while keeping the same DSA layer
- Add tagging with a Graph structure to represent relationships between notes
- Persist the undo Stack and recently-viewed Queue across server restarts
