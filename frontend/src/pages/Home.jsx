import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { getLibrary, setLibraryEntry } from '../library.js';
import BookCover from '../components/BookCover.jsx';

const languageName = (code) => {
  try { return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code; }
  catch { return code; }
};
const languageCode = (query, languages) => {
  const term = query.trim().toLocaleLowerCase();
  return languages.find((code) => code.toLocaleLowerCase() === term || languageName(code).toLocaleLowerCase().startsWith(term)) || query;
};

export default function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [cats, setCats] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [cat, setCat] = useState('All');
  const [language, setLanguage] = useState('All');
  const [q, setQ] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [shelfOnly, setShelfOnly] = useState(false);
  const [sort, setSort] = useState('title');
  const [library, setLibrary] = useState(getLibrary);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ title: '', author: '', category: '', link: '', description: '' });
  const [notice, setNotice] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api('/books/categories'), api('/books/languages')])
      .then(([categories, availableLanguages]) => { setCats(categories); setLanguages(availableLanguages); })
      .catch((e) => setErr(e.message));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const query = searchBy === 'language' ? languageCode(q, languages) : q;
    const t = setTimeout(() =>
      api(`/books?category=${encodeURIComponent(cat)}&language=${encodeURIComponent(language)}&field=${encodeURIComponent(searchBy)}&q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((b) => { setBooks(b); setErr(''); }).catch((e) => {
          if (e.name !== 'AbortError') setErr(e.message);
        }), 250);
    return () => { clearTimeout(t); controller.abort(); };
  }, [cat, language, languages, q, searchBy, refresh]);

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
      const [categories, availableLanguages] = await Promise.all([api('/books/categories'), api('/books/languages')]);
      setCats(categories);
      setLanguages(availableLanguages);
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
          <span className="sr-only">Search the library</span>
          <select aria-label="Search field" className="search-field" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
            <option value="all">All fields</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="category">Category</option>
            <option value="subject">Subject</option>
            <option value="language">Language</option>
          </select>
          <input className="search" placeholder="Search title, author, subject…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </section>

      <div className="catalog-tools">
        <div className="filter-controls" aria-label="Filter books">
          <label className="sort-label">Category
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="All">All categories</option>
              {cats.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="sort-label">Language
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="All">All languages</option>
              {languages.map((code) => <option key={code} value={code}>{languageName(code)}</option>)}
            </select>
          </label>
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
          <article key={b._id} className="book" dir={b.language === 'ur' ? 'rtl' : 'ltr'}>
            <Link to={`/books/${b._id}`} className="cover-link" aria-label={`Open ${b.title}`}>
              <BookCover book={b} />
            </Link>
            <div className="book-info">
              <div className="book-topline">
                <span className="cat">{b.category}</span>
              </div>
              <Link to={`/books/${b._id}`} className="book-link">
                <h3>{b.title}</h3>
                <span className="author">{b.author}</span>
              </Link>
              <p className="book-description">{b.description}</p>
              <p className="book-facts">
                {languageName(b.language || 'en')} · {b.pageCount ? `${b.pageCount} pages` : 'Page count not listed'} · {b.source || 'Project Gutenberg'}
              </p>
              <div className="book-actions">
                {b.readerUrl ? (
                  <Link className="btn small" to={`/books/${b._id}/read`}>Read Now</Link>
                ) : b.readerType === 'external' ? (
                  <a className="btn small" href={b.link} target="_blank" rel="noreferrer">Open source</a>
                ) : (
                  <Link className="btn small" to={`/books/${b._id}/read`}>{library[b._id]?.page > 0 ? 'Continue reading' : 'Read Now'}</Link>
                )}
                <button className={library[b._id]?.saved ? 'save-button saved' : 'save-button'} onClick={() => saveBook(b._id)} aria-label={library[b._id]?.saved ? `Remove ${b.title} from my shelf` : `Save ${b.title} for later`}>
                  {library[b._id]?.saved ? 'Saved' : 'Save for later'}
                </button>
              </div>
              {library[b._id]?.status && <span className="reading-status">{library[b._id].status === 'reading' ? 'Currently reading' : 'Finished'}</span>}
            </div>
          </article>
        ))}
      </div>
      {!err && visibleBooks.length === 0 && <p className="muted">{shelfOnly ? 'Your shelf is empty. Save a book to keep it here.' : 'No books match. Try another category or search.'}</p>}

      {user?.role === 'admin' && (
        <section className="admin-tools">
          <h2>Add a free book</h2>
          <p className="muted">Add a Project Gutenberg title with a complete plaintext edition.</p>
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
