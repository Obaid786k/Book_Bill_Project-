import { STATES } from './constants';

// GSTIN = 2-digit state code + PAN (5 letters, 4 digits, 1 letter) + entity no. + 'Z' + check char.
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const cleanGstin = (v = '') => String(v).toUpperCase().replace(/\s+/g, '').slice(0, 15);

export const isValidGstin = (v) => GSTIN_RE.test(cleanGstin(v));

// State name from the first two digits, e.g. "09..." -> "Uttar Pradesh".
export const stateFromGstin = (v) => {
  const code = cleanGstin(v).slice(0, 2);
  return code.length === 2 ? STATES.find((s) => s.c === code)?.n || '' : '';
};
