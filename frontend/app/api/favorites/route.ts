export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getBackendUrl } from '@/shared/utils/backend'

function getToken(req: Request) {
  const cookieStore = cookies()
  const authHeader = req.headers.get('authorization')
  let token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    const tokenCookie = cookieStore.get('access_token')
    token = tokenCookie?.value
  }
  
  return token
}

export async function GET(req: Request) {
  try {
    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const response = await fetch(getBackendUrl('/favorites'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Favorites API error:', error)
    return NextResponse.json({ items: [], total: 0 })
  }
}
