import { NextResponse } from 'next/server'
import { getAdminSignals } from '@/shared/utils/ai'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ items: getAdminSignals() })
}

