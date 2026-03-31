# TaskBoard

A Task management app built with React, Node.js, and SQLite.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite with Prisma ORM
- **Drag & Drop**: @dnd-kit

## Getting Started

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
- All changes are saved to the database

## Project Structure

```
backend/          # Express API server
├── src/
│   ├── index.js  # Main server
│   └── routes/   # API endpoints
└── prisma/       # Database schema

frontend/         # React + Vite app
├── src/
│   ├── components/  # UI components
│   ├── hooks/       # Custom hooks
│   └── api.js       # API client
```

## Scripts

```bash
npm run setup           # Install deps + set up DB
npm run dev            # Start both backend and frontend
npm run dev:backend    # Start only backend
npm run dev:frontend   # Start only frontend
```

## Deployment on Vercel

### Prerequisites

1. [Vercel account](https://vercel.com)
2. GitHub repository (already set up)
3. A production database (PostgreSQL recommended)

### Step 1: Set Up Production Database

For Vercel, SQLite won't work reliably. Use PostgreSQL instead:

**Option A: Railway**
- Go to [railway.app](https://railway.app) and sign up
- Create a new PostgreSQL database
- Copy the `DATABASE_URL` connection string

**Option B: Supabase**
- Go to [supabase.com](https://supabase.com) and sign up
- Create a new project
- Copy the PostgreSQL connection string

### Step 2: Update Prisma Schema

In `backend/prisma/schema.prisma`, change the datasource to use PostgreSQL instead of SQLite.

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variable: `DATABASE_URL` with your PostgreSQL connection string
5. Click "Deploy"

### Step 4: Run Database Migrations

After deployment:

```bash
DATABASE_URL="your_postgres_url" npx prisma migrate deploy
```

Your app will be live at your Vercel domain!

### Notes

- The `vercel.json` file configures routing between frontend and backend
- Frontend auto-builds during deployment
- All API requests are proxied from `/api` to backend
