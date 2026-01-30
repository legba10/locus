export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { getAdminOverview } from '@/shared/utils/ai'

export async function GET() {
  return NextResponse.json({ item: getAdminOverview() })
}

