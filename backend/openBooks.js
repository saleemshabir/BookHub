const cheerio = require('cheerio');

const urduClassics = [
  ['kulliyat-e-akbar', 'Kulliyat-e-Akbar Allahabadi', 'Akbar Allahabadi', 'Collected Urdu poetry', 'https://archive.org/details/in.ernet.dli.2015.424971', 'https://archive.org/embed/in.ernet.dli.2015.424971', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['gulzar-e-dagh', 'Gulzar-e-Dagh', 'Dagh Dehlvi', 'Urdu poetry collection', 'https://archive.org/details/in.ernet.dli.2015.335658', 'https://archive.org/embed/in.ernet.dli.2015.335658', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['bahishti-zewar', 'Bahishti Zewar', 'Ashraf Ali Thanvi', 'Islamic handbook', 'https://archive.org/details/bahishti-zewar-by-shaykh-ashraf-ali-thanvir.a', 'https://archive.org/embed/bahishti-zewar-by-shaykh-ashraf-ali-thanvir.a', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['sirat-un-nabi', 'Sirat-un-Nabi', 'Shibli Nomani and Sulaiman Nadvi', 'Biography of the Prophet Muhammad', 'https://archive.org/details/siratunnabi0001alla', 'https://archive.org/embed/siratunnabi0001alla', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['al-faruq', 'Al-Faruq', 'Shibli Nomani', 'Islamic history and biography', 'https://archive.org/details/dli.ernet.424914', 'https://archive.org/embed/dli.ernet.424914', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['seerat-un-noman', 'Seerat-un-Noman', 'Shibli Nomani', 'Biography of Imam Abu Hanifa', 'https://archive.org/details/SeeratUnNoman', 'https://archive.org/embed/SeeratUnNoman', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['al-ghazali', 'Al-Ghazali', 'Shibli Nomani', 'Biography of Imam Al-Ghazali', 'https://archive.org/details/al-ghazali-by-allama-shibli-nomani', 'https://archive.org/embed/al-ghazali-by-allama-shibli-nomani', 'Internet Archive', 'CC0 1.0'],
  ['khutbat-e-madras', 'Khutbat-e-Madras', 'Sulaiman Nadvi', 'Lectures on Islamic history and thought', 'https://archive.org/details/in.ernet.dli.2015.375915', 'https://archive.org/embed/in.ernet.dli.2015.375915', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['diwan-e-ghalib', 'Diwan-e-Ghalib', 'Mirza Ghalib', 'Classic Urdu poetry collection', 'https://archive.org/details/dli.ernet.243634', 'https://archive.org/embed/dli.ernet.243634', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['kulliyat-e-mir', 'Kulliyat-e-Mir', 'Mir Taqi Mir', 'Collected Urdu poetry', 'https://archive.org/details/kulliyatimir', 'https://archive.org/embed/kulliyatimir', 'Internet Archive', 'Public Domain Mark 1.0'],
  ['bang-e-dara', 'Bang-e-Dara', 'Muhammad Iqbal', 'Urdu poetry collection', 'https://archive.org/details/bangedarabyallamaiqbal.pdf', 'https://archive.org/embed/bangedarabyallamaiqbal.pdf', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['pitras-ke-mazameen', 'Pitras ke Mazameen', 'Pitras Bukhari', 'Urdu essays and humor', 'https://archive.org/details/dli.ernet.241316', 'https://archive.org/embed/dli.ernet.241316', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['aab-e-hayat-azad', 'Aab-e-Hayat (Muhammad Husain Azad)', 'Muhammad Husain Azad', 'History and criticism of Urdu literature', 'https://archive.org/details/AbeHayat', 'https://archive.org/embed/AbeHayat', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['umrao-jan-ada', 'Umrao Jan Ada', 'Mirza Hadi Ruswa', 'Classic Urdu novel', 'https://archive.org/details/umraojanada0000rusw', 'https://archive.org/embed/umraojanada0000rusw', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['musaddas-e-hali', 'Musaddas-e-Hali', 'Altaf Husain Hali', 'Urdu narrative poetry', 'https://archive.org/details/in.ernet.dli.2015.244339', 'https://archive.org/embed/in.ernet.dli.2015.244339', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['hayat-e-javed', 'Hayat-e-Javed', 'Altaf Husain Hali', 'Biography of Sir Syed Ahmad Khan', 'https://archive.org/details/dli.language.2478', 'https://archive.org/embed/dli.language.2478', 'Internet Archive', 'CC BY-NC 4.0'],
  ['mirat-ul-uroos', 'Mirat-ul-Uroos', 'Deputy Nazir Ahmad', 'Classic Urdu novel', 'https://archive.org/details/MiratUlUroosByDeputyNazeerAhmad', 'https://archive.org/embed/MiratUlUroosByDeputyNazeerAhmad', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['taubat-un-nasuh', 'Taubat-un-Nasuh', 'Deputy Nazir Ahmad', 'Classic Urdu novel', 'https://archive.org/details/dli.ministry.30866', 'https://archive.org/embed/dli.ministry.30866', 'Internet Archive', 'Public-domain work in India/Pakistan; scan rights not independently verified'],
  ['sahr-ul-bayan', 'Sahr-ul-Bayan', 'Mir Hasan', 'Classic Urdu masnavi', 'https://ur.wikisource.org/wiki/سحر_البیان', 'https://ur.wikisource.org/wiki/سحر_البیان', 'Urdu Wikisource', 'CC BY-SA; attribution and share-alike apply'],
  ['bazaar-e-husn', 'Bazaar-e-Husn', 'Premchand', 'Classic Urdu novel', 'https://www.rekhta.org/ebooks/detail/bazar-e-husn-part-001-premchand-ebooks', 'https://www.rekhta.org/ebooks/detail/bazar-e-husn-part-001-premchand-ebooks', 'Rekhta', 'Free to read on Rekhta; hosting rights not granted'],
].map(([slug, title, author, description, link, readerUrl, source, rightsStatus]) => {
  return {
    sourceId: `urdu-classic-${slug}`,
    title,
    author,
    category: 'Soha',
    description,
    subjects: ['Urdu literature'],
    language: 'ur',
    source,
    rightsStatus,
    link,
    readerUrl,
    readerType: 'external',
    completeText: false,
  };
});

const openBooks = [
  {
    sourceId: 'ur-wikisource-quran',
    title: 'قرآن مجید (اردو)',
    author: 'Translator not identified on source index',
    category: 'Soha',
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
    category: 'Soha',
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
    category: 'Soha',
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
  ...urduClassics,
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