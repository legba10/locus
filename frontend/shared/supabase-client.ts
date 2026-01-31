import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Dummy client for build/prerender when env is missing — never throws.
 * Next.js prerender runs in Node; if ENV is not set, we return this instead of throwing.
 */
function createDummyClient(): SupabaseClient {
  const noop = () => Promise.resolve({ data: null, error: null })
  const session = { data: { session: null }, error: null }
  return {
    auth: {
      getSession: () => Promise.resolve(session),
      getUser: noop,
      signInWithPassword: noop,
      signUp: noop,
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    } as SupabaseClient['auth'],
    storage: {
      from: () => ({
        getPublicUrl: (path: string) => ({ data: { publicUrl: path || '' } }),
        upload: noop,
        remove: noop,
      }),
    } as SupabaseClient['storage'],
  } as unknown as SupabaseClient
}

/**
 * Lazy Supabase client. During build/prerender (Node, env may be missing) — returns dummy, no throw.
 * In browser with env — creates real client. In browser without env — throws.
 */
function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isBuild = typeof window === 'undefined'
  if (!url || !key) {
    if (isBuild) return createDummyClient()
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
  }
  _client = createClient(url, key)
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as Record<string, unknown>)[prop as string]
  },
})

export const LISTINGS_BUCKET = 'locus-listings'

export function getSupabaseImageUrl(filePath: string): string | null {
  try {
    const { data } = getSupabase().storage.from(LISTINGS_BUCKET).getPublicUrl(filePath)
    return data?.publicUrl ?? null
  } catch {
    return null
  }
}

export function isSupabaseUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(supabaseUrl && url.includes(supabaseUrl))
}
