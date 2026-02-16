import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

function ensureEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      throw new Error("Missing required environment variable: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
    }
    const serviceRoleKey = ensureEnv("SUPABASE_SERVICE_ROLE_KEY");
    supabase = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return supabase;
}
