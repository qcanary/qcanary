import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// ── Lazy initialization ────────────────────────────────────
// Uses null | undefined sentinel pattern (same as resend.ts, dodo.ts).
// The client is created lazily so importing this module never throws at module scope.
let _client: SupabaseClient<Database> | null | undefined;

function getClient(): SupabaseClient<Database> {
  if (_client !== undefined) {
    if (!_client) {
      throw new Error('Missing required environment variable: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
    }
    return _client;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    _client = null;
    throw new Error('Missing required environment variable: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  }

  _client = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  });

  return _client;
}

// Proxy-based export so all existing `supabase.from(...)` etc. call patterns work unchanged.
// The proxy intercepts every property access and delegates to the lazily-initialized client.
export const supabase: SupabaseClient<Database> = new Proxy<SupabaseClient<Database>>(
  {} as SupabaseClient<Database>,
  {
    get(_, prop: keyof SupabaseClient<Database>) {
      return getClient()[prop];
    },
  }
);

export default supabase;
