import { NextResponse } from 'next/server'
import { getAdminOverview } from '@/shared/utils/ai'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ item: getAdminOverview() })
}

