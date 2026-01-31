import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Lazy Supabase client — createClient() runs only on first use (runtime), never at module load.
 * Prevents "supabaseUrl is required" during Next.js build / prerender.
 */
function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
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
    return data.publicUrl
  } catch {
    return null
  }
}

export function isSupabaseUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(supabaseUrl && url.includes(supabaseUrl))
}
