const router = require('express').Router();
const { Book, Comment } = require('../models');
const { auth, admin } = require('../middleware/auth');
const { sourceById, readOpenBook } = require('../openBooks');
const { isExcludedBook } = require('../libraryPolicy');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const gutenbergId = (link = '') => link.match(/^https:\/\/www\.gutenberg\.org\/ebooks\/(\d+)(?:[/?#]|$)/)?.[1];
const catalogFilter = {
  category: { $not: /^Medical$/i },
  $or: [{ completeText: true }, { readerType: 'external' }],
};
const textCache = new Map();

function allowedReaderUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      (url.hostname === 'archive.org' && url.pathname.startsWith('/embed/'))
      || (url.hostname === 'ur.wikisource.org' && url.pathname.startsWith('/wiki/'))
      || (url.hostname === 'www.rekhta.org' && url.pathname.startsWith('/ebooks/detail/'))
      || (url.hostname.endsWith('wikipedia.org') && url.pathname.startsWith('/wiki/'))
    );
  } catch {
    return false;
  }
}

async function getCompleteText(book) {
  const id = book.sourceId || gutenbergId(book.link);
  const url = book.plainTextUrl || (id && `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`);
  if (!id || !url) return null;
  if (textCache.has(url)) return textCache.get(url);
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok || !(response.headers.get('content-type') || '').includes('text/plain')) return null;
    const content = await response.text();
    if (content.length < 10000 || /<html[\s>]/i.test(content.slice(0, 1000))) return null;
    textCache.set(url, content);
    return content;
  } catch {
    return null;
  }
}

// List books (optional ?category=&q=)
router.get('/', async (req, res) => {
  const { category, language, subject, q, field = 'all' } = req.query;
  const filter = { $and: [catalogFilter] };
  if (category && category !== 'All') {
    if (category === 'Recently Added') {
      filter.$and.push({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
    } else {
      filter.category = category;
    }
  }
  if (language && language !== 'All') filter.language = language;
  if (subject) filter.subjects = new RegExp(escapeRe(subject), 'i');
  if (q) {
    const pattern = new RegExp(escapeRe(q), 'i');
    const fields = {
      title: [{ title: pattern }],
      author: [{ author: pattern }],
      category: [{ category: pattern }],
      subject: [{ subjects: pattern }],
      language: [{ language: pattern }],
      all: [{ title: pattern }, { author: pattern }, { category: pattern }, { subjects: pattern }, { language: pattern }],
    };
    filter.$and.push({ $or: fields[field] || fields.all });
  }
  res.json(await Book.find(filter).sort('title'));
});

router.get('/categories', async (_req, res) => {
  const categories = new Set(await Book.distinct('category', catalogFilter));
  const hasRecentBooks = await Book.exists({
    ...catalogFilter,
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  if (hasRecentBooks) categories.add('Recently Added');
  res.json(Array.from(categories).sort());
});
router.get('/languages', async (_req, res) => res.json((await Book.distinct('language', catalogFilter)).sort()));

router.get('/:id/read', async (req, res) => {
  const book = await Book.findById(req.params.id).catch(() => null);
  const embedUrl = book?.readerUrl || (book?.readerType === 'external' ? book.link : null);
  if (book?.readerType === 'external' && allowedReaderUrl(embedUrl))
    return res.json({ book, embedUrl });
  if (!book || !book.completeText) return res.status(404).json({ message: 'Complete in-app text is not available for this book' });
  if (book.readerType !== 'gutenberg') {
    const result = sourceById.has(book.sourceId) && await readOpenBook(book.sourceId);
    if (!result) return res.status(502).json({ message: 'The complete licensed edition is temporarily unavailable' });
    return res.json(result);
  }
  const content = await getCompleteText(book);
  if (!content) return res.status(502).json({ message: 'The complete text is temporarily unavailable' });
  res.json({ book, content, chapters: [] });
});

router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id).catch(() => null);
  const embedUrl = book?.readerUrl || (book?.readerType === 'external' ? book.link : null);
  book && ((book.readerType === 'external' && allowedReaderUrl(embedUrl)) || (book.completeText && (book.readerType !== 'gutenberg' ? sourceById.has(book.sourceId) : gutenbergId(book.link))))
    ? res.json(book)
    : res.status(404).json({ message: 'Book not found' });
});

// Admin: add a book
router.post('/', auth, admin, async (req, res) => {
  if (isExcludedBook(req.body))
    return res.status(400).json({ message: 'This category or title is not included in the library' });
  const id = gutenbergId(req.body.link);
  const plainTextUrl = id && `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
  const candidate = { link: req.body.link, sourceId: id, plainTextUrl };
  if (!id || !(await getCompleteText(candidate)))
    return res.status(400).json({ message: 'Use a Project Gutenberg ebook URL with a verified complete plain-text edition' });
  try { res.json(await Book.create({
    ...req.body,
    source: 'Project Gutenberg',
    rightsStatus: 'Public domain',
    sourceId: id,
    plainTextUrl,
    readerType: 'gutenberg',
    completeText: true,
  })); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

// Comments
router.get('/:id/comments', async (req, res) =>
  res.json(await Comment.find({ book: req.params.id }).sort('-createdAt')));

router.post('/:id/comments', auth, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Write something before posting' });
  res.json(await Comment.create({ book: req.params.id, user: req.user.id, userName: req.user.name, text }));
});

router.delete('/comments/:cid', auth, async (req, res) => {
  const c = await Comment.findById(req.params.cid);
  if (!c) return res.status(404).json({ message: 'Comment not found' });
  if (String(c.user) !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'You can only delete your own comments' });
  await c.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
