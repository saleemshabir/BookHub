import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { hue } from '../hue.js';
import { getBookProgress, setLibraryEntry } from '../library.js';

const PAGE_LENGTH = 18000;

function paginate(content, chapters = []) {
  const pages = [];
  const sections = chapters.length ? chapters : [{ start: 0, end: content.length }];
  for (const section of sections) {
    let start = section.start;
    while (start < section.end) {
      let end = Math.min(start + PAGE_LENGTH, section.end);
      if (end < section.end) {
        const lineBreak = content.lastIndexOf('\n', end);
        if (lineBreak > start + PAGE_LENGTH / 2) end = lineBreak + 1;
      }
      pages.push({ start, text: content.slice(start, end) });
      start = end;
    }
  }
  return pages;
}

function highlighted(text, query) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.split(new RegExp(`(${escaped})`, 'ig')).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? <mark key={index}>{part}</mark> : part);
}

export default function Reader() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [content, setContent] = useState('');
  const [pages, setPages] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [search, setSearch] = useState('');
  const [searchNotice, setSearchNotice] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    let active = true;
    setBook(null);
    setEmbedUrl('');
    setErr('');
    api(`/books/${id}/read`)
      .then((data) => {
        if (active) {
          setBook(data.book);
          if (data.embedUrl) {
            setEmbedUrl(data.embedUrl);
            return;
          }
          setContent(data.content);
          setChapters(data.chapters || []);
          const bookPages = paginate(data.content, data.chapters || []);
          setPages(bookPages);
          setCurrentPage(Math.min(getBookProgress(id), Math.max(0, bookPages.length - 1)));
        }
      })
      .catch((e) => { if (active) setErr(e.message); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!book || embedUrl || !pages.length) return;
    setLibraryEntry(id, {
      saved: true,
      status: currentPage === pages.length - 1 ? 'finished' : 'reading',
      page: currentPage,
    });
  }, [book, currentPage, id, pages.length]);

  const findInBook = (event) => {
    event.preventDefault();
    const term = search.trim().toLocaleLowerCase();
    if (!term) return setSearchNotice('Enter a word or phrase to search.');
    const index = content.toLocaleLowerCase().indexOf(term);
    if (index < 0) return setSearchNotice('No matches in this book.');
    const page = pages.findIndex(({ start, text }) => index >= start && index < start + text.length);
    setCurrentPage(Math.max(0, page));
    setSearchNotice(`Showing the first match, on page ${page + 1}.`);
  };

  const currentChapter = chapters.findIndex((chapter) =>
    pages[currentPage]?.start >= chapter.start && pages[currentPage]?.start < chapter.end);
  const selectChapter = (index) => {
    const chapter = chapters[index];
    if (!chapter) return;
    const page = pages.findIndex(({ start, text }) => chapter.start >= start && chapter.start < start + text.length);
    setCurrentPage(Math.max(0, page));
  };

  if (err) return <p className="error">{err} <Link to="/">Back to the library</Link></p>;
  if (!book) return <p className="muted">Loading complete text…</p>;
  if (embedUrl) return (
    <article className="reader" dir={book.language === 'ur' ? 'rtl' : 'ltr'} style={{ '--h': hue(book.category) }}>
      <div className="reader-toolbar">
        <Link to={`/books/${id}`} className="back">Book details</Link>
        <a href={book.link} target="_blank" rel="noreferrer">Source: {book.source}</a>
      </div>
      <header className="reader-heading">
        <span className="cat">{book.category} · {book.source}</span>
        <h1>{book.title}</h1>
        <p className="author">{book.author}</p>
      </header>
      <iframe className="reader-embed" src={embedUrl} title={`Read ${book.title}`} referrerPolicy="no-referrer" allowFullScreen />
    </article>
  );

  return (
    <article className="reader" dir={book.language === 'ur' ? 'rtl' : 'ltr'} style={{ '--h': hue(book.category), '--reader-size': `${fontSize}px` }}>
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
      <form className="reader-search" onSubmit={findInBook}>
        <input aria-label="Search within this book" placeholder="Find in this book" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn small">Find</button>
        {searchNotice && <span className="muted" role="status">{searchNotice}</span>}
      </form>
      {chapters.length > 0 && (
        <label className="chapter-select">Jump to chapter
          <select value={Math.max(0, currentChapter)} onChange={(e) => selectChapter(Number(e.target.value))}>
            {chapters.map((chapter, index) => <option key={`${chapter.start}-${chapter.title}`} value={index}>{chapter.title}</option>)}
          </select>
        </label>
      )}
      <div className="page-controls">
        <button className="chip" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>Previous page</button>
        <span>Page {currentPage + 1} of {pages.length}</span>
        <button className="chip" onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))} disabled={currentPage >= pages.length - 1}>Next page</button>
      </div>
      <progress className="reading-progress" value={currentPage + 1} max={pages.length} aria-label="Reading progress" />
      <pre className="reader-text">{highlighted(pages[currentPage]?.text || '', search)}</pre>
      <p className="reader-end">{currentPage === pages.length - 1 ? 'End of text' : 'Your place is saved automatically.'}</p>
    </article>
  );
}