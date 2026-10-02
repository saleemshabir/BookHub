# BookHub – Free Study Books (MERN)

A full-stack MERN app: browse source-backed public-domain books, read complete texts in BookHub, search metadata, save titles to a personal shelf, track reading position, and comment on books.

**Stack:** MongoDB + Mongoose, Express, React (Vite), Node.js, JWT auth (bcrypt).

## Features
- Additive import of verified Project Gutenberg public-domain books plus selected, license-verified open textbooks (Pro Git, Eloquent JavaScript, Open Data Structures)
- Soha shelf for Urdu books: public-domain Bagh-o-Bahar and Fasana-e-Azad volumes, plus the Urdu Wikisource Quran text
- Real author, subject, language, summary, cover, source, and rights metadata where supplied; unknown page counts are not invented
- Filter by category and language; search title, author, category, subject, or language
- Paginated in-app reader with chapter navigation for supported open books, text search, and automatic saved position
- Save books to a browser-based personal shelf and track titles as currently reading or finished
- The Religion & Spirituality category is removed; Soha is a limited Urdu exception for verified Islamic texts, while sensitive-title matches remain excluded
- Register / log in (JWT)
- Comment on any book; delete your own comments (admins can delete any)
- Admin can add books from the catalog page or with `POST /api/books`; new entries are checked for a complete plain-text edition

## Setup
1. Install Node.js 18+ and MongoDB (or use a free MongoDB Atlas URI).
2. `npm run install-all`
3. Edit `backend/.env` (set `MONGO_URI` and a long random `JWT_SECRET`).
4. `npm run seed` (imports available public-domain metadata and creates the initial admin account; change its password).
5. Terminal 1: `npm run server` (backend)  (API on :5000)
6. Terminal 2: `npm run client` (frontend)  (app on http://localhost:5173)

## API
| Method | Route | Auth |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | – |
| GET | /api/books?category=&language=&field=&q= | – |
| GET | /api/books/categories, /api/books/languages, /api/books/:id | – |
| GET | /api/books/:id/read | – |
| POST | /api/books | admin |
| GET | /api/books/:id/comments | – |
| POST | /api/books/:id/comments | user |
| DELETE | /api/books/comments/:cid | owner/admin |

## Folders
- `backend/`  – Node + Express + MongoDB API (server.js, models, routes, middleware, seed.js)
- `frontend/` – React app (Vite)
