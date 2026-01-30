import { NextResponse } from 'next/server'
import { getAdminModerationQueue } from '@/shared/utils/ai'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ items: getAdminModerationQueue() })
}

