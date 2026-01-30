import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Safe init with env validation
function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }
  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

export const supabase = createSupabaseClient();

export const LISTINGS_BUCKET = "locus-listings";

export function getSupabaseImageUrl(filePath: string): string | null {
  const { data } = supabase.storage.from(LISTINGS_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export function isSupabaseUrl(url: string): boolean {
  return Boolean(supabaseUrl && url.includes(supabaseUrl));
}
