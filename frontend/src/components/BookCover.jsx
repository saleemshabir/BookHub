import { useState } from 'react';
import { hue } from '../hue.js';

export default function BookCover({ book, className = '' }) {
  const [unavailable, setUnavailable] = useState(false);
  const id = book.link.match(/\/ebooks\/(\d+)/)?.[1];
  const src = id && `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`;

  return (
    <div className={`book-cover ${className}`} style={{ '--h': hue(book.category) }}>
      {(!src || unavailable) && <span className="book-cover-fallback">{book.title}</span>}
      {src && !unavailable && (
        <img src={src} alt={`Cover of ${book.title}`} loading="lazy" onError={() => setUnavailable(true)} />
      )}
    </div>
  );
}