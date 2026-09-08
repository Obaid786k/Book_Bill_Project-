// src/utils/handleSupabaseError.js
import { getFriendlyError } from './errorMessages';
import { logSystemEvent } from '../services/logService';

export class AppError extends Error {
  constructor(friendly, originalError, context = {}) {
    super(friendly.message);
    this.name = 'AppError';
    this.surface = friendly.surface || 'toast';
    this.field = friendly.field || null;
    this.code = originalError?.code || originalError?.error_code || 'APP_ERROR';
    this.context = context;
  }
}

/**
 * Centralized error handler for Supabase operations.
 * 
 * @param {Error|object} error - Raw error from Supabase / network
 * @param {object} context - Technical context { table: string, action: string }
 * @returns {AppError} - Normalized AppError containing message, surface, and field
 */
export function handleSupabaseError(error, context = {}) {
  if (!error) return null;

  const friendly = getFriendlyError(error);

  // Safe technical logging (zero personal, bill, or product content)
  const detail = `${context.table || 'unknown'}:${context.action || 'unknown'}:${error.code || error.error_code || 'ERR'}`;
  logSystemEvent({
    event_type: 'error',
    detail,
    metadata: { code: error.code || error.error_code },
  });

  return new AppError(friendly, error, context);
}
