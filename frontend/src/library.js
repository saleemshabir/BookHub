const STORAGE_KEY = 'bookhub-library';

export function getLibrary() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function setLibraryEntry(bookId, entry) {
  const library = getLibrary();
  const next = { ...library, [bookId]: { ...library[bookId], ...entry } };
  if (!next[bookId].saved && !next[bookId].status) delete next[bookId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}