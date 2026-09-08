// src/lib/normalizeError.js
import { handleSupabaseError } from '../utils/handleSupabaseError';

/**
 * Legacy bridge: funnels all existing normalizeError calls through the
 * centralized handleSupabaseError utility so there is strictly one source of truth.
 */
export function normalizeError(error, context = {}) {
  if (!error) return null;
  return handleSupabaseError(error, context);
}
