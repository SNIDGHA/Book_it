# Book_it

A small full-stack demo app (backend: Node/Express/Mongoose, frontend: React + Vite + TypeScript) for booking experiences.

This repository contains two folders:
- `backend/` — Express API, Mongoose models, and a seeder script.
- `frontend/` — React + Vite frontend (TypeScript).

> Notes: This README assumes you're on Windows (PowerShell) and have Node.js and MongoDB locally installed.

## Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node.js)
- MongoDB running locally (or a reachable MongoDB URI)

## Environment
The backend reads `MONGODB_URI` from the environment. If not provided, it defaults to `mongodb://127.0.0.1:27017/book_it`.

You can create a `.env` file in `backend/` with the following content if you want to override the URI or PORT:

MONGODB_URI="mongodb://127.0.0.1:27017/book_it"
PORT=4000

## Install dependencies
Open PowerShell and run (from repo root):

```powershell
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd ..\frontend
npm install
```

## Seed the database
A seeder script is available in `backend/src/seed.js`. It clears some collections and inserts sample experiences, slots and promos.

From the repo root (PowerShell):

```powershell
cd backend
# Make sure MongoDB is running locally or MONGODB_URI is set
npm run seed
```

If you need to run the script directly with Node:

```powershell
node src/seed.js
```

## Run the backend
From the backend folder you can run either a watched dev server or the plain start:

```powershell
# from repo root
cd backend
# dev (auto-restart on file changes)
npm run dev
# or
npm start
```

The server listens on the `PORT` environment variable (defaults to 4000). API endpoints are available under `/api` (for example: `http://localhost:4000/api/experiences`).

## Run the frontend
From the frontend folder:

```powershell
cd frontend
npm run dev
```

Open the local Vite URL printed in the terminal (usually `http://localhost:5173`). The frontend expects the backend to be running at the configured backend URL (defaults to `http://localhost:4000`).

## Useful scripts
- `backend`:
  - `npm run dev` — run backend with file-watch
  - `npm start` — run backend normally
  - `npm run seed` — run seeder
- `frontend`:
  - `npm run dev` — start Vite dev server
  - `npm run build` — build static assets
  - `npm run preview` — preview build

## Troubleshooting
- Port conflicts: If you see `EADDRINUSE`, stop the process that is using the port (or change `PORT` in `.env`).
- MongoDB errors: Ensure MongoDB is running and `MONGODB_URI` is correct.
- If experiences don't appear: run the seeder again (`npm run seed`) to repopulate sample data.

## Repo layout
- backend/
  - src/
    - index.js (express app)
    - models.js (Mongoose schemas)
    - seed.js (seeder)
- frontend/
  - src/ (React + TSX pages and components)

## Deployment

### Backend (Render.com)
1. Create an account on [Render](https://render.com)
2. Connect your GitHub repository
3. Click "New +" and select "Web Service"
4. Choose this repo and use these settings:
   - Name: book-it-api
   - Region: Frankfurt (or your preferred region)
   - Branch: main
   - Root Directory: ./
   - Environment: Node
   - Build Command: cd backend && npm install
   - Start Command: cd backend && npm start
5. Add environment variables:
   - NODE_ENV: production
   - MONGODB_URI: (your MongoDB Atlas URI)

### Frontend (Vercel)
1. Create an account on [Vercel](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. From the frontend directory:
   ```powershell
   cd frontend
   vercel login
   vercel
   ```
4. For subsequent deploys:
   ```powershell
   vercel --prod
   ```

### MongoDB Atlas (Database)
1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
2. Create a new cluster (free tier is fine)
3. Add your IP to the allowlist
4. Create a database user
5. Get your connection string and add it to Render.com environment variables

### Environment Variables
- Backend (add in Render.com dashboard):
  - NODE_ENV: production
  - MONGODB_URI: mongodb+srv://...
- Frontend (already configured in .env.production):
  - VITE_API_URL: https://book-it-api.onrender.com/api

Live URLs:
- Frontend: https://book-it-site.vercel.app
- API: https://book-it-api.onrender.com

## About
This repo was pushed to GitHub at: https://github.com/SNIDGHA/Book_it.git
