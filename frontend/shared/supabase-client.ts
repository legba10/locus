/**
 * Supabase Client — TRUE SINGLETON
 * 
 * CRITICAL: Only ONE instance must exist in the entire app.
 * Multiple instances cause "Multiple GoTrueClient instances" error.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton instance — cached after first creation
let supabaseInstance: SupabaseClient | null = null

/**
 * Get or create the singleton Supabase client
 */
function getOrCreateClient(): SupabaseClient {
  // Return cached instance if exists
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Server-side build — return mock
  if (typeof window === 'undefined') {
    // During SSR/build, return a mock that won't crash
    // but also won't be cached (so client-side gets real client)
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
        signUp: async () => ({ data: { session: null, user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      storage: {
        from: () => ({
          getPublicUrl: (path: string) => ({ data: { publicUrl: path || '' } }),
          upload: async () => ({ data: null, error: null }),
        }),
      },
      from: () => ({
        select: async () => ({ data: [], error: null }),
      }),
    } as unknown as SupabaseClient
  }

  // Client-side — create real client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[Supabase] Missing env vars:', { url: !!url, key: !!key })
    throw new Error('Supabase configuration missing')
  }

  console.log('[Supabase] Creating singleton client')
  
  // Create and cache the singleton
  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseInstance
}

/**
 * The singleton Supabase client
 * Use this everywhere — do NOT create new clients
 */
export const supabase = getOrCreateClient()

// Re-export for backwards compatibility
export function getSupabaseClient(): SupabaseClient {
  return supabase
}

export const LISTINGS_BUCKET = 'locus-listings'

export function getSupabaseImageUrl(filePath: string): string | null {
  if (!filePath) return null
  try {
    const { data } = supabase.storage.from(LISTINGS_BUCKET).getPublicUrl(filePath)
    return data?.publicUrl ?? null
  } catch {
    return null
  }
}

export function isSupabaseUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(supabaseUrl && url.includes(supabaseUrl))
}
