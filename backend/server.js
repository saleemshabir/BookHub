require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookhub')
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
