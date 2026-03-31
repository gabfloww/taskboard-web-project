# 📋 TaskBoard

A Trello-style task management app built with React, Node.js/Express, and SQLite (via Prisma).

---

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React 18 + Vite               |
| Backend  | Node.js + Express             |
| Database | SQLite via Prisma ORM         |
| DnD      | @dnd-kit/core + @dnd-kit/sortable |

---

## Quick Start

### Option A — All-in-one (recommended)

```bash
# 1. Install root dev tools
npm install

# 2. Set up backend (installs deps, migrates DB, seeds data)
#    and install frontend deps
npm run setup

# 3. Start both servers simultaneously
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

### Option B — Manual (two terminals)

**Terminal 1 — Backend**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
node src/seed.js       # optional: loads sample data
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
taskboard/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # DB schema (Column, Task)
│   ├── src/
│   │   ├── index.js            # Express app entry point
│   │   ├── db.js               # Prisma client singleton
│   │   ├── seed.js             # Sample data seeder
│   │   └── routes/
│   │       ├── columns.js      # GET/POST/PATCH/DELETE /api/columns
│   │       └── tasks.js        # POST/PATCH/DELETE + reorder /api/tasks
│   ├── .env                    # DATABASE_URL + PORT
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api.js              # Fetch wrapper for all API calls
│   │   ├── hooks/
│   │   │   └── useBoard.js     # State management hook
│   │   ├── components/
│   │   │   ├── Column.jsx      # Column with sortable task list
│   │   │   ├── TaskCard.jsx    # Draggable task card
│   │   │   ├── EditTaskModal.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   ├── App.jsx             # Root component + DnD context
│   │   └── index.css           # Global design tokens
│   ├── vite.config.js          # Proxies /api → :3001
│   └── package.json
│
├── package.json                # Root scripts (setup + concurrently)
└── README.md
```

---

## API Reference

### Columns
| Method | Endpoint           | Description           |
|--------|--------------------|-----------------------|
| GET    | /api/columns       | All columns + tasks   |
| POST   | /api/columns       | Create column         |
| PATCH  | /api/columns/:id   | Update title/color    |
| DELETE | /api/columns/:id   | Delete (cascades)     |

### Tasks
| Method | Endpoint           | Description                     |
|--------|--------------------|---------------------------------|
| POST   | /api/tasks         | Create task                     |
| PATCH  | /api/tasks/:id     | Edit task fields                |
| DELETE | /api/tasks/:id     | Delete task                     |
| POST   | /api/tasks/reorder | Bulk update positions (drag-drop)|

---

## Features

- ✅ Create, edit, delete tasks with title, description, and priority
- ✅ Drag-and-drop tasks between columns (persisted to DB)
- ✅ Add, rename, delete columns with custom colors
- ✅ Input validation on both frontend and backend
- ✅ Optimistic UI updates for smooth drag-and-drop
- ✅ SQLite database — zero config, file-based
- ✅ Keyboard accessible modals (Esc to close)
