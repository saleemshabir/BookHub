const cheerio = require('cheerio');

const openBooks = [
  {
    sourceId: 'ur-wikisource-fasana-e-ajaib',
    title: 'فسانۂ عجائب',
    author: 'مرزا رجب علی بیگ سرور',
    category: 'Literature & Fiction',
    description: 'A celebrated Urdu prose tale by Rajab Ali Beg Suroor, presented as a complete in-app edition.',
    subjects: ['Urdu literature', 'Classic fiction', 'Dastan'],
    language: 'ur',
    source: 'Urdu Wikisource',
    rightsStatus: 'Public domain',
    link: 'https://ur.wikisource.org/wiki/فسانۂ_عجائب',
    readerType: 'licensed-html',
    completeText: true,
  },
  {
    sourceId: 'ur-wikisource-aab-e-hayat',
    title: 'آبِ حیات',
    author: 'محمد حسین آزاد',
    category: 'History & Biography',
    description: 'Muhammad Husain Azad’s history of Urdu poetry and its major poets, read in BookHub.',
    subjects: ['Urdu literature', 'Poetry', 'Literary history'],
    language: 'ur',
    source: 'Urdu Wikisource',
    rightsStatus: 'Public domain',
    link: 'https://ur.wikisource.org/wiki/آب_حیات',
    readerType: 'licensed-html',
    completeText: true,
  },
  {
    sourceId: 'ur-wikisource-quran',
    title: 'قرآن مجید (اردو)',
    author: 'Translator not identified on source index',
    category: 'Personal Picks',
    description: 'Urdu Quran text organized by its 114 surahs on Urdu Wikisource.',
    subjects: ['Urdu', 'Quran', 'Islamic text'],
    language: 'ur',
    source: 'Urdu Wikisource',
    rightsStatus: 'CC BY-SA',
    link: 'https://ur.wikisource.org/wiki/قرآن',
    readerType: 'licensed-html',
    completeText: true,
  },
  {
    sourceId: 'ia-bagh-o-bahar',
    title: 'Bagh-o-Bahar',
    author: 'Mir Amman Dehlvi',
    category: 'Literature & Fiction',
    description: 'A classic Urdu prose narrative, preserved as a complete public-domain text.',
    subjects: ['Urdu literature', 'Classic fiction'],
    language: 'ur',
    source: 'Internet Archive',
    rightsStatus: 'Public Domain Mark 1.0',
    link: 'https://archive.org/details/baaghobahar',
    coverUrl: 'https://archive.org/services/img/baaghobahar',
    readerType: 'licensed-text',
    completeText: true,
  },
  ...[1, 2, 3, 4].map((volume) => ({
    sourceId: `ia-fasana-e-azad-v${volume}`,
    archiveId: `fasanaiazad-v${volume}`,
    title: `Fasana-e-Azad - ${String(volume).padStart(2, '0')}`,
    author: 'Ratan Nath Dhar Sarshar',
    category: 'Literature & Fiction',
    description: `Volume ${volume} of the classic Urdu novel Fasana-e-Azad.`,
    subjects: ['Urdu novel', 'Classic fiction'],
    language: 'ur',
    source: 'Internet Archive',
    rightsStatus: 'CC0 1.0',
    link: `https://archive.org/details/fasanaiazad-v${volume}`,
    coverUrl: `https://archive.org/services/img/fasanaiazad-v${volume}`,
    readerType: 'licensed-text',
    completeText: true,
  })),
  {
    sourceId: 'open-eloquent-javascript-4e',
    title: 'Eloquent JavaScript, 4th Edition',
    author: 'Marijn Haverbeke',
    category: 'Programming',
    description: 'A complete introduction to JavaScript, browser programming, and Node.js.',
    subjects: ['JavaScript', 'Programming', 'Web development'],
    language: 'en',
    source: 'Eloquent JavaScript',
    rightsStatus: 'CC BY-NC 3.0',
    link: 'https://eloquentjavascript.net/',
    readerType: 'licensed-html',
    completeText: true,
  },
  {
    sourceId: 'open-pro-git-2e',
    title: 'Pro Git, 2nd Edition',
    author: 'Scott Chacon and Ben Straub',
    category: 'Computer Science & Technology',
    description: 'A complete guide to Git, from basic concepts to internals and team workflows.',
    subjects: ['Git', 'Version control', 'Software development'],
    language: 'en',
    source: 'Pro Git',
    rightsStatus: 'CC BY-NC-SA 3.0',
    link: 'https://git-scm.com/book/en/v2',
    readerType: 'licensed-html',
    completeText: true,
  },
  {
    sourceId: 'open-data-structures-python',
    title: 'Open Data Structures (in pseudocode)',
    author: 'Pat Morin',
    category: 'Computer Science & Technology',
    description: 'A complete, rigorous introduction to data structures, algorithms, and analysis.',
    subjects: ['Data structures', 'Algorithms', 'Computer science'],
    language: 'en',
    source: 'Open Data Structures',
    rightsStatus: 'CC BY',
    link: 'https://opendatastructures.org/ods-python/',
    readerType: 'licensed-html',
    completeText: true,
  },
];

const sourceById = new Map(openBooks.map((book) => [book.sourceId, book]));
const readerCache = new Map();
const readers = {
  'ur-wikisource-fasana-e-ajaib': {
    indexUrl: 'https://ur.wikisource.org/wiki/فسانۂ_عجائب',
    rootUrl: 'https://ur.wikisource.org/wiki/',
    linkPattern: /^\/wiki\/فسانۂ_عجائب\//,
    container: '#mw-content-text .mw-parser-output',
    minimumChapters: 10,
  },
  'ur-wikisource-aab-e-hayat': {
    indexUrl: 'https://ur.wikisource.org/wiki/آب_حیات/فہرست_مطالب',
    rootUrl: 'https://ur.wikisource.org/wiki/',
    linkPattern: /^\/wiki\/آب_حیات\//,
    container: '#mw-content-text .mw-parser-output',
    minimumChapters: 8,
  },
  'ur-wikisource-quran': {
    indexUrl: 'https://ur.wikisource.org/wiki/قرآن',
    rootUrl: 'https://ur.wikisource.org/wiki/',
    linkPattern: /^\/wiki\/سور(?:ۃ|ہ|ة)_/,
    container: '#mw-content-text .mw-parser-output',
    minimumChapters: 114,
    extraChapters: [{
      url: 'https://ur.wikisource.org/wiki/1-%D8%B3%D9%88%D8%B1%DB%81_%D9%81%D8%A7%D8%AA%D8%AD%DB%81',
      title: 'سورة الفاتحة',
    }],
  },
  'ia-bagh-o-bahar': {
    textUrl: 'https://archive.org/download/baaghobahar/baghobahar_djvu.txt',
  },
  ...[1, 2, 3, 4].reduce((map, volume) => {
    map[`ia-fasana-e-azad-v${volume}`] = {
      textUrl: `https://archive.org/download/fasanaiazad-v${volume}/fasanaiazad-v${volume}_djvu.txt`,
    };
    return map;
  }, {}),
  'open-eloquent-javascript-4e': {
    indexUrl: 'https://eloquentjavascript.net/',
    rootUrl: 'https://eloquentjavascript.net/',
    linkPattern: /^\d{2}_[a-z0-9_]+\.html$/i,
    container: 'article',
    minimumChapters: 20,
  },
  'open-pro-git-2e': {
    indexUrl: 'https://git-scm.com/book/en/v2',
    rootUrl: 'https://git-scm.com/book/en/v2/',
    linkPattern: /^\/book\/en\/v2\//,
    container: '#content',
    minimumChapters: 60,
  },
  'open-data-structures-python': {
    indexUrl: 'https://opendatastructures.org/ods-python/Contents.html',
    rootUrl: 'https://opendatastructures.org/ods-python/',
    linkPattern: /^\d+_[A-Za-z0-9_]+\.html$/,
    container: 'body',
    minimumChapters: 14,
  },
};

async function fetchHtml(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'BookHub/1.0 (open text reader)' },
        signal: AbortSignal.timeout(20000),
      });
      if (response.ok && (response.headers.get('content-type') || '').includes('text/html'))
        return await response.text();
      if (response.status < 500) return null;
    } catch {
      if (attempt === 2) return null;
    }
  }
  return null;
}

function chapterLinks(html, reader) {
  const $ = cheerio.load(html);
  const links = [];
  const seen = new Set();
  const selector = reader.container === '#content' ? '#content a[href]' : 'a[href]';
  $(selector).each((_, element) => {
    const href = $(element).attr('href');
    if (!href || seen.has(href)) return;
    let decodedHref;
    try { decodedHref = decodeURIComponent(href); }
    catch { return; }
    if (!reader.linkPattern.test(decodedHref)) return;
    const url = new URL(href, reader.indexUrl);
    const root = new URL(reader.rootUrl);
    if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return;
    seen.add(href);
    links.push({ url: url.href, title: $(element).text().trim().replace(/\s+/g, ' ') });
  });
  for (const chapter of reader.extraChapters || []) {
    if (!seen.has(chapter.url)) links.unshift(chapter);
    seen.add(chapter.url);
  }
  return links;
}

function chapterText(html, reader, title) {
  const $ = cheerio.load(html);
  $('script,style,noscript,svg,nav,footer,header,.navigation,.book-navigation,.toc').remove();
  const content = $(reader.container).first();
  if (!content.length) return null;
  const heading = content.find('h1').first().text().trim() || title;
  const text = content.text().replace(/\u00a0/g, ' ').replace(/[\t ]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (text.length < 200) return null;
  return { title: heading, text };
}

async function loadOpenBook(sourceId, reader, book) {
  if (reader.textUrl) {
    try {
      const response = await fetch(reader.textUrl, {
        headers: { 'User-Agent': 'BookHub/1.0 (open text reader)' },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok || !(response.headers.get('content-type') || '').includes('text/plain')) return null;
      const content = await response.text();
      if (content.length < 10000 || /<html[\s>]/i.test(content.slice(0, 1000))) return null;
      return { book, content, chapters: [] };
    } catch {
      return null;
    }
  }

  const index = await fetchHtml(reader.indexUrl);
  if (!index) return null;
  const links = chapterLinks(index, reader);
  if (links.length < reader.minimumChapters) return null;

  const chapters = new Array(links.length);
  let next = 0;
  const workers = Array.from({ length: 5 }, async () => {
    while (next < links.length) {
      const index = next++;
      const link = links[index];
      const html = await fetchHtml(link.url);
      chapters[index] = html && chapterText(html, reader, link.title);
    }
  });
  await Promise.all(workers);
  if (chapters.some((chapter) => !chapter)) return null;

  let content = '';
  const chapterRanges = chapters.map((chapter) => {
    const start = content.length;
    content += `${chapter.title}\n\n${chapter.text}\n\n`;
    return { title: chapter.title, start, end: content.length };
  });
  return { book, content, chapters: chapterRanges };
}

async function readOpenBook(sourceId) {
  const reader = readers[sourceId];
  const book = sourceById.get(sourceId);
  if (!reader || !book) return null;
  if (readerCache.has(sourceId)) return readerCache.get(sourceId);

  const pending = loadOpenBook(sourceId, reader, book);
  readerCache.set(sourceId, pending);
  try {
    const result = await pending;
    if (!result) readerCache.delete(sourceId);
    return result;
  } catch {
    readerCache.delete(sourceId);
    return null;
  }
}

module.exports = { openBooks, sourceById, readOpenBook };
