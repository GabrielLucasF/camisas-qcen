import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  return true;
};

/**
 * Client-side Supabase client using public Anon Key.
 * Subject to Row Level Security (RLS) policies.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Server-side Supabase client.
 * Prioritizes the secret SUPABASE_SERVICE_ROLE_KEY for authorized server operations,
 * falling back to the anon key if service role is not configured.
 */
export const getSupabaseServerClient = (): SupabaseClient | null => {
  if (!supabaseUrl) {
    return null;
  }
  const keyToUse = supabaseServiceKey || supabaseAnonKey;
  if (!keyToUse) {
    return null;
  }
  return createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
