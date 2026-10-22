# 📚 BookHub | Free Online Book Library

**Discover, read, and organize books for free.**

BookHub is a full-stack MERN web application that allows users to explore public-domain books and verified open educational resources, read supported books directly in the browser, manage a personal reading shelf, track reading progress, and interact with other readers through comments.

Built with the MERN stack, BookHub aims to make educational resources and literature more accessible through a simple and user-friendly reading experience.

## ✨ Features

### 📖 Book Discovery & Catalog
- Browse a collection of public-domain books and verified open textbooks.
- Search by title, author, category, subject, or language.
- Filter books by category and language.
- View available metadata, including summaries, covers, authors, sources, and licensing information.
- Support for English and selected Urdu-language texts.

### 📚 In-App Reading Experience
- Read supported books directly inside BookHub.
- Navigate chapters in supported editions.
- Search within book text.
- Automatically save reading position.
- Continue reading from where you left off.
- Support for paginated reading where available.

### 🔖 Personal Reading Shelf
- Save books to a personal shelf in the browser.
- Track books currently being read.
- Mark books as finished.
- Keep your reading organized.

### 🔐 Authentication & User Accounts
- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Protected actions for authenticated users.

### 💬 Community & Comments
- Post comments on books.
- Delete your own comments.
- Admins can moderate comments across the platform.

### 🛡️ Book Management & Content Verification
- Import public-domain book metadata from Project Gutenberg.
- Include selected open textbooks with verified licensing.
- Add books through the admin interface or API.
- Validate new catalog entries for a complete plain-text edition.
- Preserve source and rights metadata where available.

### 🌐 Supported Resources
- Project Gutenberg public-domain books.
- Pro Git.
- Eloquent JavaScript.
- Open Data Structures.
- Selected Urdu public-domain literature, including *Bagh-o-Bahar* and *Fasana-e-Azad*.
- Selected Urdu text resources from Wikisource.

*Book availability and reading functionality depend on the source, edition, and supported text format.*

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Frontend and development server |
| JavaScript | Application logic |
| HTML5 | Web page structure |
| CSS3 | Styling and responsive layouts |
| Node.js | Backend runtime |
| Express.js | REST API |
| MongoDB | Database |
| Mongoose | Database modeling |
| JWT | Authentication |
| bcrypt | Password hashing |

## 📂 Project Structure

```text
BookHub/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── seed.js
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── package.json
├── package.json
└── README.md
```

*The structure above represents the main application components. Your actual files may differ.*

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js 18 or later](https://nodejs.org/)
- npm
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd BookHub
```

Replace `YOUR_REPOSITORY_URL` with your repository's GitHub URL.

### 2. Install Dependencies

From the project root, run:

```bash
npm run install-all
```

This assumes the root `package.json` defines the `install-all` script for the root, backend, and frontend dependencies.

### 3. Configure Environment Variables

Create or edit `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Replace the example values with your actual MongoDB connection string and a strong, randomly generated JWT secret.

**Security:** Never commit your `.env` file or expose your database credentials and JWT secret publicly.

### 4. Seed the Database

Run:

```bash
npm run seed
```

This imports the available book catalog data and creates the initial admin account, according to the project's seed implementation.

Change the initial admin password before using the application in a shared or production environment.

### 5. Start the Backend

Open Terminal 1 in the project root:

```bash
npm run server
```

The backend API runs on port `5000`, unless configured otherwise.

### 6. Start the Frontend

Open Terminal 2 in the project root:

```bash
npm run client
```

Open the application in your browser:

**http://localhost:5173**

## 🔌 API Documentation

The following endpoints describe the main API routes.

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/books` | Public |
| GET | `/api/books/categories` | Public |
| GET | `/api/books/languages` | Public |
| GET | `/api/books/:id` | Public |
| GET | `/api/books/:id/read` | Public |
| POST | `/api/books` | Admin |
| GET | `/api/books/:id/comments` | Public |
| POST | `/api/books/:id/comments` | Authenticated user |
| DELETE | `/api/books/comments/:cid` | Comment owner or admin |

### Book Search Example

```http
GET /api/books?category=Programming&language=English&q=JavaScript
```

The books endpoint supports filtering and searching through the query parameters implemented by the backend.

## 📜 Book Sources & Licensing

BookHub prioritizes legally accessible reading resources.

- Public-domain works are sourced from established public-domain collections.
- Open textbooks are included only when their licenses have been verified.
- Source and rights information are retained where available.
- Missing information, such as page counts, is not fabricated.
- Reading availability depends on the edition and the source's permitted usage.

Always consult the original source and license before redistributing book files or text.

## 🔮 Future Improvements

Potential improvements include:

- Cloud-synchronized reading progress and personal shelves.
- Bookmarks, highlights, and personal notes.
- Advanced recommendations based on reading preferences.
- Improved mobile reading experience.
- Additional language support.
- Automated testing and API documentation.
- Deployment with a production database and secure environment configuration.

## 🎯 Project Objective

BookHub was developed to provide a centralized platform for discovering and reading free educational resources and public-domain literature. It combines a searchable catalog, an in-browser reading experience, reading-progress tracking, authentication, and community interaction in one application.

The project also demonstrates practical implementation of full-stack web development using the MERN stack.

## 👨‍💻 Author

**Saleem Shabir**

- GitHub: [@saleemshabir](https://github.com/saleemshabir)

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request describing your improvements.

## 📄 License

Add a `LICENSE` file to the repository before specifying a project license. BookHub's license does not automatically grant redistribution rights to the books it references or includes.

---

**If you find BookHub useful, consider giving the repository a star!** ⭐
