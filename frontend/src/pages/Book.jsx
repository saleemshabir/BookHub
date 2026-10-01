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
    <article className="detail" style={{ '--h': hue(book.category) }}>
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
      <div className="reading-actions">
        <Link className="btn" to={`/books/${id}/read`}>Read the complete book</Link>
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
