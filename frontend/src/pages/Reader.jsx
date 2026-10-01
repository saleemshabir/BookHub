import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { hue } from '../hue.js';

export default function Reader() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [err, setErr] = useState('');

  useEffect(() => {
    let active = true;
    api(`/books/${id}/read`)
      .then((data) => {
        if (active) {
          setBook(data.book);
          setContent(data.content);
        }
      })
      .catch((e) => { if (active) setErr(e.message); });
    return () => { active = false; };
  }, [id]);

  if (err) return <p className="error">{err} <Link to="/">Back to the library</Link></p>;
  if (!book) return <p className="muted">Loading complete text…</p>;

  return (
    <article className="reader" style={{ '--h': hue(book.category), '--reader-size': `${fontSize}px` }}>
      <div className="reader-toolbar">
        <Link to={`/books/${id}`} className="back">Book details</Link>
        <div className="reader-size" aria-label="Text size controls">
          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} aria-label="Decrease text size" disabled={fontSize <= 14}>A−</button>
          <span>{fontSize}px</span>
          <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} aria-label="Increase text size" disabled={fontSize >= 26}>A+</button>
        </div>
      </div>
      <header className="reader-heading">
        <span className="cat">{book.category} · Complete text</span>
        <h1>{book.title}</h1>
        <p className="author">{book.author}</p>
      </header>
      <pre className="reader-text">{content}</pre>
      <p className="reader-end">End of text</p>
    </article>
  );
}