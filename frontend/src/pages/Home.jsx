import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { getLibrary, setLibraryEntry } from '../library.js';
import BookCover from '../components/BookCover.jsx';

export default function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [shelfOnly, setShelfOnly] = useState(false);
  const [sort, setSort] = useState('title');
  const [library, setLibrary] = useState(getLibrary);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ title: '', author: '', category: '', link: '', description: '' });
  const [notice, setNotice] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { api('/books/categories').then(setCats).catch((e) => setErr(e.message)); }, []);
  useEffect(() => {
    const t = setTimeout(() =>
      api(`/books?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}`)
        .then((b) => { setBooks(b); setErr(''); }).catch((e) => setErr(e.message)), 250);
    return () => clearTimeout(t);
  }, [cat, q, refresh]);

  const saveBook = (bookId) => {
    const next = setLibraryEntry(bookId, { saved: !library[bookId]?.saved });
    setLibrary(next);
  };

  const addBook = async (e) => {
    e.preventDefault();
    setNotice('');
    setErr('');
    try {
      await api('/books', { method: 'POST', body: form });
      setForm({ title: '', author: '', category: '', link: '', description: '' });
      setCats(await api('/books/categories'));
      setNotice('Book added to the catalog.');
      setRefresh((value) => value + 1);
    } catch (e) { setErr(e.message); }
  };

  const visibleBooks = books
    .filter((book) => !shelfOnly || library[book._id]?.saved)
    .sort((a, b) => (a[sort] || '').localeCompare(b[sort] || ''));

  return (
    <>
      <section className="intro">
        <p className="eyebrow">An open library</p>
        <h1>Welcome to a quiet corner of free reading.</h1>
        <p>Explore public-domain books, save what you love, and pick up where you left off.</p>
        <label className="search-wrap">
          <span className="sr-only">Search books by title or author</span>
          <input className="search" placeholder="Search by title or author" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </section>

      <div className="catalog-tools">
        <div className="chips" aria-label="Filter books by category">
          {['All', ...cats].map((c) => (
            <button key={c} className={c === cat ? 'chip on' : 'chip'} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="library-controls">
          <button className={shelfOnly ? 'chip on' : 'chip'} onClick={() => setShelfOnly(!shelfOnly)}>
            My shelf <span className="count">{Object.values(library).filter((entry) => entry.saved).length}</span>
          </button>
          <label className="sort-label">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
          </label>
        </div>
      </div>

      {err && <p className="error">{err}. Check that the server is running and the database is seeded.</p>}
      <div className="grid">
        {visibleBooks.map((b) => (
          <article key={b._id} className="book">
            <Link to={`/books/${b._id}`} className="cover-link" aria-label={`Open ${b.title}`}>
              <BookCover book={b} />
            </Link>
            <div className="book-info">
              <div className="book-topline">
                <span className="cat">{b.category}</span>
                <button className={library[b._id]?.saved ? 'save-button saved' : 'save-button'} onClick={() => saveBook(b._id)} aria-label={library[b._id]?.saved ? `Remove ${b.title} from my shelf` : `Save ${b.title} to my shelf`} title={library[b._id]?.saved ? 'Remove from my shelf' : 'Save to my shelf'}>
                  {library[b._id]?.saved ? 'Saved' : '+ Save'}
                </button>
              </div>
              <Link to={`/books/${b._id}`} className="book-link">
                <h3>{b.title}</h3>
                <span className="author">{b.author}</span>
              </Link>
              {library[b._id]?.status && <span className="reading-status">{library[b._id].status === 'reading' ? 'Currently reading' : 'Finished'}</span>}
            </div>
          </article>
        ))}
      </div>
      {!err && visibleBooks.length === 0 && <p className="muted">{shelfOnly ? 'Your shelf is empty. Save a book to keep it here.' : 'No books match. Try another category or search.'}</p>}

      {user?.role === 'admin' && (
        <section className="admin-tools">
          <h2>Add a free book</h2>
          <p className="muted">Add a title with a link to its free reading edition.</p>
          <form className="book-form" onSubmit={addBook}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <input type="url" placeholder="Project Gutenberg ebook URL" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} required />
            <textarea rows="3" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="btn">Add book</button>
          </form>
          {notice && <p className="success">{notice}</p>}
        </section>
      )}
    </>
  );
}
