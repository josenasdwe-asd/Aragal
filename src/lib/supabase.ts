import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service role key (bypasses RLS).
 * NEVER import this in a client component — the service role key is secret.
 *
 * Lazy initialization: the client is only created on first access, not at
 * module import time. This prevents build-time errors when env vars aren't
 * available during Next.js's static page data collection phase.
 */
function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/**
 * Proxy that lazily creates the Supabase client on first property access.
 * This allows the module to be imported at build time without throwing.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as never)[prop as string];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
