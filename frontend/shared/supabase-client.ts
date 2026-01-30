import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const LISTINGS_BUCKET = "locus-listings";

export function getSupabaseImageUrl(filePath: string): string | null {
  const { data } = supabase.storage.from(LISTINGS_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function isSupabaseUrl(url: string): boolean {
  return Boolean(supabaseUrl && url.includes(supabaseUrl));
}
