import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { hue } from '../hue.js';
import { getLibrary, setLibraryEntry } from '../library.js';
import BookCover from '../components/BookCover.jsx';

export default function Book() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [library, setLibrary] = useState(getLibrary);

  const load = () => api(`/books/${id}/comments`).then(setComments).catch((e) => setErr(e.message));
  useEffect(() => {
    api(`/books/${id}`).then(setBook).catch((e) => setErr(e.message));
    load();
  }, [id]);

  const post = async (e) => {
    e.preventDefault();
    setErr('');
    try { await api(`/books/${id}/comments`, { method: 'POST', body: { text } }); setText(''); load(); }
    catch (e) { setErr(e.message); }
  };
  const remove = async (cid) => { await api(`/books/comments/${cid}`, { method: 'DELETE' }); load(); };
  const updateLibrary = (entry) => setLibrary(setLibraryEntry(id, entry));

  if (!book) return <p className={err ? 'error' : 'muted'}>{err || 'Loading…'}</p>;

  return (
    <article className="detail" dir={book.language === 'ur' ? 'rtl' : 'ltr'} style={{ '--h': hue(book.category) }}>
      <Link to="/" className="back">Back to all books</Link>
      <div className="detail-heading">
        <BookCover book={book} className="detail-cover" />
        <div className="spine-head">
          <span className="cat">{book.category}</span>
          <h1>{book.title}</h1>
          <p className="author">{book.author}</p>
        </div>
      </div>
      <p className="desc">{book.description}</p>
      <dl className="book-metadata">
        <div><dt>Language</dt><dd>{new Intl.DisplayNames(['en'], { type: 'language' }).of(book.language || 'en') || book.language}</dd></div>
        <div><dt>Pages</dt><dd>{book.pageCount || 'Not listed by source'}</dd></div>
        <div><dt>Source</dt><dd><a href={book.link} target="_blank" rel="noreferrer">{book.source || 'Project Gutenberg'}</a></dd></div>
        <div><dt>Rights</dt><dd>{book.rightsStatus || 'Public domain'}</dd></div>
        {book.subjects?.length > 0 && <div className="subject-list"><dt>Subjects</dt><dd>{book.subjects.slice(0, 8).join(' · ')}</dd></div>}
      </dl>
      <div className="reading-actions">
        {book.readerUrl || (book.readerType === 'external' && /^https:\/\/([a-z-]+\.)?wikipedia\.org\/wiki\//.test(book.link)) ? (
          <Link className="btn" to={`/books/${id}/read`}>Read Now</Link>
        ) : book.readerType === 'external' ? (
          <a className="btn" href={book.link} target="_blank" rel="noreferrer">Open source</a>
        ) : (
          <Link className="btn" to={`/books/${id}/read`}>{library[id]?.page > 0 ? 'Continue reading' : 'Read Now'}</Link>
        )}
        <button className={library[id]?.saved ? 'chip on' : 'chip'} onClick={() => updateLibrary({ saved: !library[id]?.saved })}>
          {library[id]?.saved ? 'Saved to my shelf' : 'Save to my shelf'}
        </button>
        <label className="sort-label">Reading status
          <select value={library[id]?.status || ''} onChange={(e) => updateLibrary({ status: e.target.value || null })}>
            <option value="">Not started</option>
            <option value="reading">Currently reading</option>
            <option value="finished">Finished</option>
          </select>
        </label>
      </div>

      <section className="comments">
        <h2>Comments ({comments.length})</h2>
        {user ? (
          <form onSubmit={post}>
            <textarea rows="3" maxLength="1000" placeholder="What did you think of this book?" value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn">Post comment</button>
          </form>
        ) : (
          <p className="muted"><Link to="/login">Log in</Link> to comment.</p>
        )}
        {err && <p className="error">{err}</p>}
        {comments.map((c) => (
          <div key={c._id} className="comment">
            <div className="meta">
              <strong>{c.userName}</strong>
              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              {user && (user.id === c.user || user.role === 'admin') && (
                <button className="link danger" onClick={() => remove(c._id)}>Delete</button>
              )}
            </div>
            <p>{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="muted">No comments yet. Start the conversation.</p>}
      </section>
    </article>
  );
}
