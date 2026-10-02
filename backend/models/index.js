const m = require('mongoose');

const User = m.model('User', new m.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true }));

const Book = m.model('Book', new m.Schema({
  title: { type: String, required: true },
  author: String,
  category: { type: String, required: true, index: true },
  description: String,
  subjects: [String],
  language: { type: String, default: 'en', index: true },
  pageCount: Number,
  source: { type: String, default: 'Project Gutenberg' },
  rightsStatus: { type: String, default: 'Public domain' },
  sourceId: String,
  readerType: { type: String, enum: ['gutenberg', 'licensed-html', 'licensed-text', 'external'], default: 'gutenberg' },
  readerUrl: String,
  plainTextUrl: String,
  coverUrl: String,
  link: { type: String, required: true }, // free reading / download page
  completeText: { type: Boolean, default: false, index: true },
}, { timestamps: true }));

const Comment = m.model('Comment', new m.Schema({
  book: { type: m.Schema.Types.ObjectId, ref: 'Book', index: true },
  user: { type: m.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  text: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true }));

module.exports = { User, Book, Comment };
