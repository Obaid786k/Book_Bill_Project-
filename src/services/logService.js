// src/services/logService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Safe technical event logger.
 * Golden Rule: Never logs sensitive bill, product, or customer data.
 * Logs only technical details: table:action:code.
 */
export async function logSystemEvent({ event_type = 'error', detail = '', metadata = {} }) {
  try {
    // In local development or testing, technical detail is logged to console
    if (import.meta.env.DEV) {
      console.warn(`[SystemLog:${event_type}] ${detail}`);
    }

    // Best-effort write to public.audit_log via the log_client_event RPC
    // (direct inserts are revoked). Only when a session exists.
    const session = (await supabase.auth.getSession().catch(() => null))?.data?.session;
    if (session?.user?.id) {
      // Result is ignored on purpose: logging must never block the user
      // (and must not call handleSupabaseError, which would recurse).
      await supabase.rpc('log_client_event', {
        p_event_type: String(event_type),
        p_detail: String(detail).slice(0, 200),
        p_code: metadata.code ? String(metadata.code) : null,
      });
    }
  } catch {
    // Silent catch: logging must never crash the application
  }
}
