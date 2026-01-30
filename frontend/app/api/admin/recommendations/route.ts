import { NextResponse } from 'next/server'
import { getAdminAiRecommendations } from '@/shared/utils/ai'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ items: getAdminAiRecommendations() })
}

