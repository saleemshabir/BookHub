const router = require('express').Router();
const { Book, Comment } = require('../models');
const { auth, admin } = require('../middleware/auth');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// List books (optional ?category=&q=)
router.get('/', async (req, res) => {
  const { category, q } = req.query;
  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (q) filter.$or = [{ title: new RegExp(escapeRe(q), 'i') }, { author: new RegExp(escapeRe(q), 'i') }];
  res.json(await Book.find(filter).sort('title'));
});

router.get('/categories', async (_req, res) => res.json((await Book.distinct('category')).sort()));

router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id).catch(() => null);
  book ? res.json(book) : res.status(404).json({ message: 'Book not found' });
});

// Admin: add a book
router.post('/', auth, admin, async (req, res) => {
  try { res.json(await Book.create(req.body)); }
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
