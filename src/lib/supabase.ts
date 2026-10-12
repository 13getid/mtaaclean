/**
 * lib/supabase.ts
 *
 * Supabase client factory for the browser.
 * Integrates Clerk session token into Supabase Authorization header
 * so that Supabase Row Level Security (RLS) can evaluate `auth.jwt() ->> 'sub'`.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Creates an authenticated Supabase client using the provided Clerk JWT token.
 * This ensures queries made from the frontend carry the user's Clerk identity into RLS.
 */
export function getAuthenticatedSupabaseClient(token?: string | null): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })
}

/**
 * Default public/anon Supabase client (used for public read operations when unauthenticated)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
