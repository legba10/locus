export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is missing')
  }
  return apiBaseUrl
}

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

export async function POST(req: Request, ctx: { params: { listingId: string } }) {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getToken(req)
    
    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const response = await fetch(
      `${apiBaseUrl}/favorites/${ctx.params.listingId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: response.status === 401 ? 'UNAUTHORIZED' : 'FAILED', message: text },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function DELETE(req: Request, ctx: { params: { listingId: string } }) {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getToken(req)
    
    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const response = await fetch(
      `${apiBaseUrl}/favorites/${ctx.params.listingId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 401 ? 'UNAUTHORIZED' : 'FAILED' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
