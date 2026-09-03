import { createClient } from '@supabase/supabase-js';

// Client creation is deliberately LAZY (not `export const supabase =
// createClient(...)` at module top level). Vite inlines env vars at BUILD
// time — if VITE_SUPABASE_URL is statically undefined (no .env present),
// an eager top-level throw here makes Rollup's dead-code-elimination
// treat the entire app as unreachable-after-guaranteed-crash and silently
// strip almost everything from the production bundle, while `npm run
// build` still reports success. Lazy init means the check only runs when
// something actually calls Supabase, at runtime — which is when we
// actually want it to fail loudly, not at build time.
let _client = null;

function getClient() {
  if (_client) return _client;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env and fill in your project values.'
    );
  }

  _client = createClient(supabaseUrl, supabasePublishableKey);
  return _client;
}

// A Proxy so every existing `import { supabase } from '...'` call site
// (already written across authService/shopService/settingsService) keeps
// working completely unchanged — `supabase.auth.x()`, `supabase.from(...)`,
// `supabase.rpc(...)` all still just work, lazily creating the real client
// on first actual use.
export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
