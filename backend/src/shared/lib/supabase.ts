import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client для Backend
 * Использует Service Role Key для полного доступа к Storage
 */
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  )
}
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is set in backend env; it is not used here.')
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
