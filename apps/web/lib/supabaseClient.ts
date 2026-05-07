import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getEnv(name: string): string | null {
  const value = process.env[name];
  return value && value.length > 0 ? value : null;
}

export function createAuthedSupabaseClient(accessToken: string): SupabaseClient | null {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    realtime: {
      params: {
        apikey: anonKey,
      },
    },
  });
}

