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

    // Best-effort write to public.audit_log if session exists
    const session = (await supabase.auth.getSession().catch(() => null))?.data?.session;
    if (session?.user?.id) {
      // Extract safe sanitized metadata only
      const safeMeta = {
        detail: String(detail).slice(0, 200),
        code: metadata.code || null,
        timestamp: new Date().toISOString(),
      };

      await supabase.from('audit_log').insert({
        actor_id: session.user.id,
        event_type: `client_${event_type}`,
        metadata: safeMeta,
      }).catch(() => {
        // Silently swallow any audit logging failure so user action is never blocked
      });
    }
  } catch {
    // Silent catch: logging must never crash the application
  }
}
