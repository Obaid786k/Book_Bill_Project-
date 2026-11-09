// Small in-memory cache for service reads, so a page you already opened
// shows its data instantly the next time (no new Supabase call).
//
// Rules that keep data correct:
//  - Entries expire after TTL (3 min) — changes made on another device show up after that.
//  - ANY save / delete in the app clears the whole cache (see `mutating`), so the
//    next read is always fresh after this user changes something.
//  - Login / logout / user switch clears it (authStore).
//  - Callers get a copy, so a page can never change the cached value by accident.
//  - Two pages asking at the same time share one request.

const TTL_MS = 3 * 60 * 1000;
const store = new Map(); // key -> { at, promise }

const copy = (v) => {
  if (v == null || typeof v !== 'object') return v;
  try { return structuredClone(v); } catch { return JSON.parse(JSON.stringify(v)); }
};

export const clearDataCache = () => store.clear();

// Wrap a read: cached(name, async (...args) => data)
export const cached = (name, fn, ttl = TTL_MS) => async (...args) => {
  const key = `${name}|${JSON.stringify(args)}`;
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttl) return copy(await hit.promise);

  const promise = fn(...args);
  store.set(key, { at: Date.now(), promise });
  try {
    return copy(await promise);
  } catch (err) {
    if (store.get(key)?.promise === promise) store.delete(key); // never cache failures
    throw err;
  }
};

// Wrap a write: clears before (so reads inside it are fresh) and after (drops anything read meanwhile).
export const mutating = (fn) => async (...args) => {
  store.clear();
  try {
    return await fn(...args);
  } finally {
    store.clear();
  }
};
