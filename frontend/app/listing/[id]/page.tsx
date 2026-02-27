import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { ListingDetailClient } from './ListingDetailClient'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

async function getListing(id: string, cookie: string | null) {
  if (!id || typeof id !== 'string') return null
  const safeId = encodeURIComponent(id)
  const url = BACKEND_URL ? `${BACKEND_URL}/api/listings/${safeId}` : null
  if (!url) return null
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        ...(cookie ? { cookie } : {}),
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data || typeof data !== 'object') return null
    const item = data.listing ?? data.item
    if (!item || !item.id) return null
    return data as { listing?: unknown; item?: unknown }
  } catch {
    return null
  }
}

interface Props {
  params: { id?: string }
}

export default async function ListingPage({ params }: Props) {
  const id = params?.id != null ? String(params.id).trim() : ''
  if (!id) notFound()

  const headersList = headers()
  const cookie = headersList.get('cookie')
  const listing = await getListing(id, cookie)

  if (!listing) notFound()

  return <ListingDetailClient id={id} initialListing={listing} />
}
