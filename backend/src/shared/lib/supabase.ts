import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client для Backend
 * Использует Service Role Key для полного доступа к Storage
 */
const supabaseUrl = process.env.SUPABASE_URL
// Railway env names sometimes differ; prefer true service-role key.
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY_V2 ??
  process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) in env'
  )
}
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is set in backend env; it is not used here.')
}
if (!supabaseServiceRoleKey && (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn(
    'Supabase ANON key is present but service-role key is missing. Backend profile upserts may fail due to RLS.'
  )
}

export const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Bucket name для изображений объявлений
 */
export const LISTINGS_BUCKET = 'locus-listings'

/**
 * Получить public URL изображения из Supabase Storage
 */
export function getSupabaseImageUrl(filePath: string): string | null {
  if (!supabase) return null
  
  const { data } = supabase.storage.from(LISTINGS_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}
