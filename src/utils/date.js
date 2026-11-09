// YYYY-MM-DD in the user's LOCAL time zone (IST for Indian users).
// toISOString() is UTC, which shows yesterday's date between 00:00 and 05:30 IST.
export const localDateStr = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 'YYYY-MM-DD' -> local Date at midnight (never via UTC).
export const parseLocalDate = (str) => {
  const [y, m, d] = String(str).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

// Whole days from a to b (local dates).
export const diffDays = (a, b) =>
  Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000);

export const isValidDateStr = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str || '') && !Number.isNaN(parseLocalDate(str).getTime());
