export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { getAdminAiRecommendations } from '@/shared/utils/ai'

export async function GET() {
  return NextResponse.json({ items: getAdminAiRecommendations() })
}

