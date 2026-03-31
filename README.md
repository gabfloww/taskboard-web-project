# TaskBoard

A Task management app built with React, Node.js, and SQLite.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Drag & Drop**: @dnd-kit

## To Open

## Option 1

Copy and Paste to your browser: 
https://taskboard-web-project-gabflores.vercel.app/


## Option 2

### 1. Install Dependencies & Set Up Database

```bash
npm install
npm run setup
```

This command will:
- Install all frontend and backend dependencies
- Create and migrate the SQLite database
- Load sample data

### 2. Start the Development Servers

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

- Frontend runs on port 5173
- Backend API runs on port 3001

## What You Can Do

- Create, edit, and delete tasks
- Drag tasks between columns
- Add and customize columns with colors
- Assign priority and description to tasks


## Scripts

```bash
npm run setup           # Install deps + set up DB
npm run dev            # Start both backend and frontend
npm run dev:backend    # Start only backend
npm run dev:frontend   # Start only frontend
```
