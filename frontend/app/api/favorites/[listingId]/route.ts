import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

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
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is missing' }, { status: 500 })
    }
    const token = getToken(req)
    
    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const response = await fetch(
      `${API_BASE_URL}/favorites/${ctx.params.listingId}`,
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
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is missing' }, { status: 500 })
    }
    const token = getToken(req)
    
    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const response = await fetch(
      `${API_BASE_URL}/favorites/${ctx.params.listingId}`,
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
