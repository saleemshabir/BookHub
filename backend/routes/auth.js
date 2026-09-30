const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const session = (u) => ({
  token: jwt.sign({ id: u._id, name: u.name, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, name: u.name, role: u.role },
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ message: 'Enter a name, an email and a password of at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'This email is already registered' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.json(session(user));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
      return res.status(400).json({ message: 'Email or password is incorrect' });
    res.json(session(user));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
