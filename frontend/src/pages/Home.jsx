import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { hue } from '../hue.js';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { api('/books/categories').then(setCats).catch((e) => setErr(e.message)); }, []);
  useEffect(() => {
    const t = setTimeout(() =>
      api(`/books?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}`)
        .then((b) => { setBooks(b); setErr(''); }).catch((e) => setErr(e.message)), 250);
    return () => clearTimeout(t);
  }, [cat, q]);

  return (
    <>
      <section className="intro">
        <h1>Free books for studying</h1>
        <p>Textbooks and classics that are free to read. Pick a subject, open a book, and share what you think.</p>
        <input className="search" placeholder="Search by title or author" value={q} onChange={(e) => setQ(e.target.value)} />
      </section>

      <div className="chips">
        {['All', ...cats].map((c) => (
          <button key={c} className={c === cat ? 'chip on' : 'chip'} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {err && <p className="error">{err}. Check that the server is running and the database is seeded.</p>}
      <div className="grid">
        {books.map((b) => (
          <Link key={b._id} to={`/books/${b._id}`} className="book" style={{ '--h': hue(b.category) }}>
            <span className="cat">{b.category}</span>
            <h3>{b.title}</h3>
            <span className="author">{b.author}</span>
          </Link>
        ))}
      </div>
      {!err && books.length === 0 && <p className="muted">No books match. Try another category or search.</p>}
    </>
  );
}
