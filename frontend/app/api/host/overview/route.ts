import { NextResponse } from 'next/server'
import { loadDb } from '@/shared/utils/mock-db'
import { getHostOverview } from '@/shared/utils/ai'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const hostId = url.searchParams.get('hostId') ?? 'host_1'
  const db = await loadDb()
  const listingCount = db.listings.filter((l) => l.hostId === hostId).length
  return NextResponse.json({ item: getHostOverview(hostId, listingCount) })
}

