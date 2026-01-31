import { createClient } from '@supabase/supabase-js'

const isBuild = typeof window === 'undefined'

export function getSupabaseClient() {
  if (isBuild) {
    return {
      auth: {
        getSession: async () => ({ data: null, error: null }),
      },
      storage: {
        from: () => ({
          getPublicUrl: (path: string) => ({ data: { publicUrl: path || '' } }),
        }),
      },
      from: () => ({
        select: async () => ({ data: [], error: null }),
      }),
    } as ReturnType<typeof createClient>
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase env missing at runtime')
  }

  return createClient(url, key)
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getSupabaseClient() as Record<string, unknown>)[prop as string]
  },
})

export const LISTINGS_BUCKET = 'locus-listings'

export function getSupabaseImageUrl(filePath: string): string | null {
  try {
    const client = getSupabaseClient()
    const { data } = client.storage.from(LISTINGS_BUCKET).getPublicUrl(filePath)
    return data?.publicUrl ?? null
  } catch {
    return null
  }
}

export function isSupabaseUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(supabaseUrl && url.includes(supabaseUrl))
}
