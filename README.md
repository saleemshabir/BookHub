# BookHub – Free Study Books (MERN)

A full-stack MERN app: browse free books by category, search, save titles to a personal shelf, track reading status, open free reading editions, and comment on each book.

**Stack:** MongoDB + Mongoose, Express, React (Vite), Node.js, JWT auth (bcrypt).

## Features
- 28 books with verified complete plain-text editions, read entirely inside BookHub
- Filter by category and search by title or author
- Save books to a browser-based personal shelf and track titles as currently reading or finished
- Register / log in (JWT)
- Comment on any book; delete your own comments (admins can delete any)
- Admin can add books from the catalog page or with `POST /api/books`; new entries are checked for a complete plain-text edition

## Setup
1. Install Node.js 18+ and MongoDB (or use a free MongoDB Atlas URI).
2. `npm run install-all`
3. Edit `backend/.env` (set `MONGO_URI` and a long random `JWT_SECRET`).
4. `npm run seed` (loads the books and creates admin `admin@bookhub.com` / `admin123`; change this password).
5. Terminal 1: `npm run server` (backend)  (API on :5000)
6. Terminal 2: `npm run client` (frontend)  (app on http://localhost:5173)

## API
| Method | Route | Auth |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | – |
| GET | /api/books?category=&q= | – |
| GET | /api/books/categories, /api/books/:id | – |
| POST | /api/books | admin |
| GET | /api/books/:id/comments | – |
| POST | /api/books/:id/comments | user |
| DELETE | /api/books/comments/:cid | owner/admin |

## Folders
- `backend/`  – Node + Express + MongoDB API (server.js, models, routes, middleware, seed.js)
- `frontend/` – React app (Vite)
