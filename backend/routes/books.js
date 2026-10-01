const router = require('express').Router();
const { Book, Comment } = require('../models');
const { auth, admin } = require('../middleware/auth');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const gutenbergId = (link = '') => link.match(/^https:\/\/www\.gutenberg\.org\/ebooks\/(\d+)(?:[/?#]|$)/)?.[1];
const fullTextFilter = { completeText: true };
const textCache = new Map();

async function getCompleteText(id) {
  if (textCache.has(id)) return textCache.get(id);
  try {
    const response = await fetch(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok || !(response.headers.get('content-type') || '').includes('text/plain')) return null;
    const content = await response.text();
    if (content.length < 10000 || /<html[\s>]/i.test(content.slice(0, 1000))) return null;
    textCache.set(id, content);
    return content;
  } catch {
    return null;
  }
}

// List books (optional ?category=&q=)
router.get('/', async (req, res) => {
  const { category, q } = req.query;
  const filter = { ...fullTextFilter };
  if (category && category !== 'All') filter.category = category;
  if (q) filter.$or = [{ title: new RegExp(escapeRe(q), 'i') }, { author: new RegExp(escapeRe(q), 'i') }];
  res.json(await Book.find(filter).sort('title'));
});

router.get('/categories', async (_req, res) => res.json((await Book.distinct('category', fullTextFilter)).sort()));

router.get('/:id/read', async (req, res) => {
  const book = await Book.findById(req.params.id).catch(() => null);
  const id = book && gutenbergId(book.link);
  if (!id || !book.completeText) return res.status(404).json({ message: 'Complete in-app text is not available for this book' });
  const content = await getCompleteText(id);
  if (!content) return res.status(502).json({ message: 'The complete text is temporarily unavailable' });
  res.json({ book: { _id: book._id, title: book.title, author: book.author, category: book.category }, content });
});

router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id).catch(() => null);
  book && book.completeText && gutenbergId(book.link) ? res.json(book) : res.status(404).json({ message: 'Book not found' });
});

// Admin: add a book
router.post('/', auth, admin, async (req, res) => {
  const id = gutenbergId(req.body.link);
  if (!id || !(await getCompleteText(id)))
    return res.status(400).json({ message: 'Use a Project Gutenberg ebook URL with a verified complete plain-text edition' });
  try { res.json(await Book.create({ ...req.body, completeText: true })); }
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
