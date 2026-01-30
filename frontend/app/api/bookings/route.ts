export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { loadDb, saveDb } from '@/shared/utils/mock-db'

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is missing')
  }
  return apiBaseUrl
}

export async function GET() {
  const db = await loadDb()
  return NextResponse.json({ items: db.bookings })
}

export async function POST(req: Request) {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const body = (await req.json()) as {
      listingId: string
      checkIn: string
      checkOut: string
      guests: number
    }

    // Пытаемся отправить в backend
    try {
      const response = await fetch(`${apiBaseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: body.listingId,
          from: body.checkIn,
          to: body.checkOut,
          guests: body.guests,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ item: data }, { status: 201 })
      }
    } catch (backendError) {
      console.warn('Backend unavailable, using mock data:', backendError)
    }

    // Fallback: mock данные
    const db = await loadDb()
    const now = new Date().toISOString()
    const id = `bkg_${Math.random().toString(16).slice(2)}`

    const checkInDate = new Date(body.checkIn)
    const checkOutDate = new Date(body.checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * 3000

    const booking = {
      id,
      listingId: body.listingId,
      userId: 'current-user',
      from: body.checkIn,
      to: body.checkOut,
      guests: body.guests,
      totalPrice,
      currency: 'RUB' as const,
      status: 'PENDING' as const,
      createdAt: now,
    }

    db.bookings.unshift(booking)
    await saveDb(db)
    return NextResponse.json({ item: booking }, { status: 201 })
  } catch (error: any) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking', message: error.message },
      { status: 500 }
    )
  }
}
