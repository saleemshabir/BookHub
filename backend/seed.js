require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Book, User } = require('./models');
const { openBooks } = require('./openBooks');
const { excludedTitle, religiousSubjects, isExcludedBook } = require('./libraryPolicy');

const G = (id) => `https://www.gutenberg.org/ebooks/${id}`;
const OS = (slug) => `https://openstax.org/details/books/${slug}`;
const unavailableTextIds = new Set(['33283', '5001']);
const topicQueries = [
  ['fiction', 'Literature & Fiction'],
  ['history', 'History'],
  ['science', 'Biology, Chemistry & Physics'],
  ['engineering', 'Engineering'],
  ['medicine', 'Medicine & Health'],
  ['art', 'Arts & Design'],
  ['philosophy', 'Philosophy & Psychology'],
  ['poetry', 'Poetry'],
  ['geography', 'Geography & Culture'],
  ['mathematics', 'Mathematics'],
  ['education', 'Education & Textbooks'],
  ['programming', 'Programming'],
  ['children', "Children's Books"],
  ['essays', 'Essays & Short Reads'],
  ['computer science', 'Computer Science & Technology'],
];

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

const oldCategories = {
  'Computer Science': 'Computer Science & Technology',
  Programming: 'Programming',
  Mathematics: 'Mathematics',
  Science: 'Biology, Chemistry & Physics',
  Literature: 'Literature & Fiction',
  Philosophy: 'Philosophy & Psychology',
};

function textFormat(formats = {}) {
  return formats['text/plain; charset=utf-8']
    || formats['text/plain; charset=us-ascii']
    || Object.entries(formats).find(([type]) => type.startsWith('text/plain'))?.[1];
}

function authorNames(authors = []) {
  return authors.map(({ name }) => name.replace(/^([^,]+),\s*(.+)$/, '$2 $1')).join(', ') || 'Author not listed';
}

function importedRecord(record, category) {
  const plainTextUrl = textFormat(record.formats);
  const subjects = record.subjects || [];
  const summary = record.summaries?.[0]?.replace(/\s+/g, ' ').trim();
  return {
    title: record.title,
    author: authorNames(record.authors),
    category,
    description: summary ? `${summary.slice(0, 280)}${summary.length > 280 ? '…' : ''}` : subjects.slice(0, 3).join(' · ') || 'Public-domain edition from Project Gutenberg.',
    subjects,
    language: record.languages?.[0] || 'en',
    source: 'Project Gutenberg',
    rightsStatus: record.copyright === false ? 'Public domain' : 'Unverified',
    sourceId: String(record.id),
    plainTextUrl,
    coverUrl: record.formats?.['image/jpeg'] || '',
    link: `https://www.gutenberg.org/ebooks/${record.id}`,
    completeText: Boolean(plainTextUrl && record.copyright === false),
  };
}

async function fetchGutendexBooks(topic, language = 'en') {
  const url = new URL('https://gutendex.com/books/');
  url.searchParams.set('languages', language);
  url.searchParams.set('mime_type', 'text/plain');
  url.searchParams.set('sort', 'popular');
  url.searchParams.set('topic', topic);
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Gutendex returned ${response.status}`);
  return (await response.json()).results || [];
}

async function runLimited(tasks, limit, worker) {
  const results = new Array(tasks.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await worker(tasks[index]);
    }
  }));
  return results;
}

async function importCatalog() {
  const imported = new Map();
  const requests = [
    ...topicQueries.map(([topic, category]) => ({ topic, category, language: 'en' })),
    ...['es', 'fr', 'de'].map((language) => ({ topic: 'fiction', category: 'Literature & Fiction', language })),
  ];
  const results = await runLimited(requests, 3, async ({ topic, category, language }) => {
    try {
      const books = await fetchGutendexBooks(topic, language);
      return books.slice(0, 32).map((result) => importedRecord(result, category));
    } catch (error) {
      console.warn(`Catalog import skipped for ${topic} (${language}): ${error.message}`);
      return [];
    }
  });

  await Book.deleteMany({ sourceId: { $in: ['urdu-classic-bagh-o-bahar-catalog', 'urdu-classic-fasana-e-azad-complete', 'urdu-classic-aab-e-hayat'] } });
  for (const records of results) {
    for (const record of records) {
      if (record.completeText && !isExcludedBook(record) && record.rightsStatus === 'Public domain' && !unavailableTextIds.has(record.sourceId) && !imported.has(record.sourceId))
        imported.set(record.sourceId, record);
    }
  }

  return imported;
}


(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookhub');
  const imported = await importCatalog();
  for (const [title, author, category, link, description] of books) {
    const id = link.match(/\/ebooks\/(\d+)/)?.[1];
    if (!id) continue;
    const metadata = imported.get(id);
    const record = metadata || {};
    const completeText = !unavailableTextIds.has(id);
    imported.set(id, {
      ...record,
      title,
      author,
      category: oldCategories[category] || category,
      description,
      subjects: record.subjects?.length ? record.subjects : [category],
      language: record.language || 'en',
      source: 'Project Gutenberg',
      rightsStatus: 'Public domain',
      sourceId: id,
      plainTextUrl: record.plainTextUrl || `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
      coverUrl: record.coverUrl || `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
      link,
      completeText,
    });
  }
  for (const book of openBooks) imported.set(book.sourceId, book);

  const existing = await Book.find({}, '_id title sourceId').lean();
  const byId = new Map(existing.filter((book) => book.sourceId).map((book) => [book.sourceId, book._id]));
  const byTitle = new Map(existing.map((book) => [book.title, book._id]));
  const operations = [...imported.values()].map((record) => {
    const existingId = byId.get(record.sourceId) || byTitle.get(record.title);
    return {
      updateOne: {
        filter: existingId ? { _id: existingId } : { sourceId: record.sourceId },
        update: { $set: record },
        upsert: true,
      },
    };
  });
  await Book.bulkWrite(operations, { ordered: false });

  await Promise.all(books.filter(([, , , link]) => !link.match(/\/ebooks\/(\d+)/)).map(([title]) =>
    Book.updateOne({ title }, { $set: { completeText: false } })));
  await Book.updateMany({
    completeText: true,
    $or: [
      { category: /religion|spiritual/i },
      { title: excludedTitle },
      { category: { $ne: 'Soha' }, $or: [{ title: religiousSubjects }, { subjects: religiousSubjects }] },
    ],
  }, { $set: { completeText: false } });
  if (!(await User.findOne({ email: 'admin@bookhub.com' })))
    await User.create({ name: 'Admin', email: 'admin@bookhub.com', password: await bcrypt.hash('admin123', 10), role: 'admin' });
  console.log(`Catalog ready: ${await Book.countDocuments({ completeText: true })} complete books available in-app; ${imported.size} sourced records processed.`);
  process.exit(0);
})();
