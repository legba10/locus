import { NextResponse } from 'next/server'
import { getHostRiskSignals } from '@/shared/utils/ai'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const hostId = url.searchParams.get('hostId') ?? 'host_1'
  return NextResponse.json({ items: getHostRiskSignals(hostId) })
}

