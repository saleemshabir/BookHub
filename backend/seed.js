require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Book, User } = require('./models');

const G = (id) => `https://www.gutenberg.org/ebooks/${id}`;
const OS = (slug) => `https://openstax.org/details/books/${slug}`;

// [title, author, category, link, description]
const books = [
  ['Algorithms', 'Jeff Erickson', 'Computer Science', 'https://jeffe.cs.illinois.edu/teaching/algorithms/', 'Full university algorithms textbook: recursion, dynamic programming, graphs, NP-hardness.'],
  ['Open Data Structures', 'Pat Morin', 'Computer Science', 'https://opendatastructures.org/', 'Lists, hash tables, trees, heaps and graphs with analysis and code.'],
  ['Structure and Interpretation of Computer Programs', 'Abelson & Sussman', 'Computer Science', 'https://mitpress.mit.edu/sites/default/files/sicp/index.html', 'Classic MIT text on abstraction, recursion and language design.'],
  ['Pro Git', 'Scott Chacon & Ben Straub', 'Programming', 'https://git-scm.com/book/en/v2', 'Everything about Git, from basic commands to internals.'],
  ['Eloquent JavaScript', 'Marijn Haverbeke', 'Programming', 'https://eloquentjavascript.net/', 'Modern JavaScript, programming concepts and browser projects.'],
  ['Automate the Boring Stuff with Python', 'Al Sweigart', 'Programming', 'https://automatetheboringstuff.com/', 'Practical Python for files, spreadsheets, web scraping and more.'],
  ['Think Python (2nd Edition)', 'Allen B. Downey', 'Programming', 'https://greenteapress.com/wp/think-python-2e/', 'Gentle introduction to programming with Python.'],
  ['Calculus Volume 1', 'OpenStax', 'Mathematics', OS('calculus-volume-1'), 'Limits, derivatives and integrals with worked examples.'],
  ['Calculus Made Easy', 'Silvanus P. Thompson', 'Mathematics', G(33283), 'A famously friendly introduction to calculus.'],
  ['University Physics Volume 1', 'OpenStax', 'Science', OS('university-physics-volume-1'), 'Mechanics, waves and thermodynamics.'],
  ['Chemistry 2e', 'OpenStax', 'Science', OS('chemistry-2e'), 'General chemistry for first-year students.'],
  ['Biology 2e', 'OpenStax', 'Science', OS('biology-2e'), 'Complete introductory biology textbook.'],
  ['On the Origin of Species', 'Charles Darwin', 'Science', G(1228), "Darwin's foundational work on evolution by natural selection."],
  ['Relativity: The Special and General Theory', 'Albert Einstein', 'Science', G(5001), 'Einstein explains relativity for a general reader.'],
  ['Pride and Prejudice', 'Jane Austen', 'Literature', G(1342), 'Classic novel of manners, marriage and misjudgment.'],
  ['Frankenstein', 'Mary Shelley', 'Literature', G(84), 'Gothic science-fiction novel about creation and responsibility.'],
  ["Alice's Adventures in Wonderland", 'Lewis Carroll', 'Literature', G(11), 'Alice falls down a rabbit hole into a world of nonsense.'],
  ['The Republic', 'Plato', 'Philosophy', G(1497), 'Plato on justice, the state and the ideal ruler.'],
  ['Meditations', 'Marcus Aurelius', 'Philosophy', G(2680), 'Stoic reflections from a Roman emperor.'],
  ['The Art of War', 'Sun Tzu', 'Philosophy', G(132), 'Ancient treatise on strategy and leadership.'],
  ['The Wealth of Nations', 'Adam Smith', 'Economics', G(3300), 'The foundational text of modern economics.'],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookhub');
  await Book.deleteMany({});
  await Book.insertMany(books.map(([title, author, category, link, description]) => ({ title, author, category, link, description })));
  if (!(await User.findOne({ email: 'admin@bookhub.com' })))
    await User.create({ name: 'Admin', email: 'admin@bookhub.com', password: await bcrypt.hash('admin123', 10), role: 'admin' });
  console.log(`Seeded ${books.length} books. Admin login: admin@bookhub.com / admin123`);
  process.exit(0);
})();
