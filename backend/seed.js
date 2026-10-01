require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Book, User } = require('./models');

const G = (id) => `https://www.gutenberg.org/ebooks/${id}`;
const OS = (slug) => `https://openstax.org/details/books/${slug}`;
const unavailableTextIds = new Set(['33283', '5001']);

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
  ['Great Expectations', 'Charles Dickens', 'Literature', G(1400), 'A coming-of-age novel of ambition, loyalty and social class.'],
  ['Jane Eyre', 'Charlotte Bronte', 'Literature', G(1260), 'A young governess seeks independence, love and a place in the world.'],
  ['Moby-Dick', 'Herman Melville', 'Literature', G(2701), 'A whaling voyage becomes an obsession with a formidable white whale.'],
  ['Dracula', 'Bram Stoker', 'Literature', G(345), 'A Gothic horror told through journals, letters and newspaper clippings.'],
  ['The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 'Literature', G(1661), 'Twelve mysteries featuring Sherlock Holmes and Dr. Watson.'],
  ['The Count of Monte Cristo', 'Alexandre Dumas', 'Literature', G(1184), 'A sweeping story of wrongful imprisonment, escape and revenge.'],
  ['The Time Machine', 'H. G. Wells', 'Literature', G(35), 'A Victorian scientist travels far into humanity\'s future.'],
  ['The War of the Worlds', 'H. G. Wells', 'Literature', G(36), 'An early science-fiction story of an invasion from Mars.'],
  ['Treasure Island', 'Robert Louis Stevenson', 'Literature', G(120), 'A young map-holder sets sail in search of buried pirate treasure.'],
  ['Little Women', 'Louisa May Alcott', 'Literature', G(37106), 'The March sisters grow up, pursue their ambitions and support one another.'],
  ['The Call of the Wild', 'Jack London', 'Literature', G(215), 'A domesticated dog adapts to life in the Yukon wilderness.'],
  ['Walden', 'Henry David Thoreau', 'Literature', G(205), 'Thoreau reflects on self-reliance and a deliberate life at Walden Pond.'],
  ['The Yellow Wallpaper', 'Charlotte Perkins Gilman', 'Literature', G(1952), 'A short story about confinement, identity and mental health.'],
  ['The Strange Case of Dr. Jekyll and Mr. Hyde', 'Robert Louis Stevenson', 'Literature', G(43), 'A London lawyer investigates the divided nature of a mysterious client.'],
  ['The Iliad', 'Homer', 'Literature', G(6130), 'An epic poem about the final weeks of the Trojan War.'],
  ['The Odyssey', 'Homer', 'Literature', G(1727), 'An epic journey of homecoming, endurance and cleverness.'],
  ['The Prince', 'Niccolo Machiavelli', 'Philosophy', G(1232), 'A Renaissance-era examination of political power and leadership.'],
  ['Utopia', 'Thomas More', 'Philosophy', G(2130), 'A dialogue imagining a society organized around shared resources.'],
  ['Common Sense', 'Thomas Paine', 'History', G(147), 'A concise 1776 argument for American independence.'],
  ['The Federalist Papers', 'Alexander Hamilton, James Madison and John Jay', 'History', G(18), 'Essays explaining and defending the proposed United States Constitution.'],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookhub');
  await Promise.all(books.map(([title, author, category, link, description]) =>
    Book.updateOne({ title }, {
      $set: { completeText: Boolean(link.match(/\/ebooks\/(\d+)/)?.[1] && !unavailableTextIds.has(link.match(/\/ebooks\/(\d+)/)[1])) },
      $setOnInsert: { title, author, category, link, description },
    }, { upsert: true })));
  if (!(await User.findOne({ email: 'admin@bookhub.com' })))
    await User.create({ name: 'Admin', email: 'admin@bookhub.com', password: await bcrypt.hash('admin123', 10), role: 'admin' });
  console.log(`Catalog ready: ${await Book.countDocuments({ completeText: true })} complete books available in-app.`);
  process.exit(0);
})();
