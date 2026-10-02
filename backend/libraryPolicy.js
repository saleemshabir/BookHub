const excludedTitle = /\b(?:sex(?:ual(?:is)?)?|erotic\w*|porn\w*|rape\w*|incest\w*|torture\w*|suicid\w*|demon\w*|devil\w*|occult\w*|necromanc\w*|witchcraft|horror\w*|antichrist|evil spirits?)\b/i;
const religiousSubjects = /\b(?:religion\w*|spiritual\w*|theolog\w*|bible|biblical|christian\w*|islam\w*|muslim\w*|hindu\w*|buddhis\w*|jewish\w*|judaism|koran|quran|sacred books|scripture\w*|church|devotional|worship|prayer|saint\w*|yogis?|yoga|theosoph\w*|apologetic\w*|gods?|gospel\w*|mosque|talmud|new thought)\b/i;

function isExcludedBook(book) {
  const subjects = Array.isArray(book.subjects) ? book.subjects.join(' ') : book.subjects || '';
  const isSoha = /^soha$/i.test(book.category || '');
  return /religion|spiritual/i.test(book.category || '')
    || excludedTitle.test(book.title || '')
    || (!isSoha && (religiousSubjects.test(book.title || '') || religiousSubjects.test(subjects)));
}

module.exports = { excludedTitle, religiousSubjects, isExcludedBook };