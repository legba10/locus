export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { getHostAiRecommendations } from '@/shared/utils/ai'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const hostId = url.searchParams.get('hostId') ?? 'host_1'
  return NextResponse.json({ items: getHostAiRecommendations(hostId) })
}

