import { NextResponse } from 'next/server'
import { loadDb } from '@/shared/utils/mock-db'
import { getHostListingStats } from '@/shared/utils/ai'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const hostId = url.searchParams.get('hostId') ?? 'host_1'
  const db = await loadDb()
  const listingIds = db.listings.filter((l) => l.hostId === hostId).map((l) => l.id)
  return NextResponse.json({ items: getHostListingStats(hostId, listingIds) })
}

