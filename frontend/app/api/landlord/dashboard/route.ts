export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getBackendUrl } from '@/shared/utils/backend'

export async function GET(req: Request) {
  try {
    const cookieStore = cookies()
    const authHeader = req.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      const tokenCookie = cookieStore.get('access_token')
      token = tokenCookie?.value
    }

    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    let response = await fetch(getBackendUrl('/landlord/dashboard'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      response = await fetch(getBackendUrl('/host/intelligence'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    }

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    const transformed = transformResponse(data)
    
    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Landlord dashboard API error:', error)
    return NextResponse.json(getMockData())
  }
}

function transformResponse(data: any) {
  if (data.summary?.avgLocusRating !== undefined) {
    return data
  }

  return {
    summary: {
      totalListings: data.summary?.totalListings ?? 0,
      publishedListings: data.summary?.totalListings ?? 0,
      avgLocusRating: data.summary?.avgQuality ?? 0,
      revenue30d: data.summary?.revenueForecast ?? 0,
      pendingBookings: 0,
      riskLevel: data.summary?.riskLevel ?? 'low',
    },
    properties: (data.properties ?? []).map((p: any) => ({
      listingId: p.listingId,
      title: p.title,
      city: p.city,
      currentPrice: p.currentPrice,
      status: p.status,
      locusRating: p.intelligence?.qualityScore ?? 0,
      ratingLabel: getRatingLabel(p.intelligence?.qualityScore ?? 0),
      priceAdvice: {
        recommended: p.intelligence?.recommendedPrice ?? p.currentPrice,
        position: p.intelligence?.marketPosition ?? 'market',
        diffPercent: p.intelligence?.priceDeltaPercent ?? 0,
      },
      riskLevel: p.intelligence?.riskLevel ?? 'low',
      bookingProbability: p.intelligence?.bookingProbability ?? 0.5,
    })),
    recommendations: data.recommendations ?? [],
    recentBookings: [],
  }
}

function getRatingLabel(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'needs_improvement'
}

function getMockData() {
  return {
    summary: {
      totalListings: 3,
      publishedListings: 2,
      avgLocusRating: 72,
      revenue30d: 45000,
      pendingBookings: 1,
      riskLevel: 'low',
    },
    properties: [
      {
        listingId: 'mock-1',
        title: 'Уютная студия в центре',
        city: 'Москва',
        currentPrice: 3500,
        status: 'PUBLISHED',
        locusRating: 78,
        ratingLabel: 'good',
        priceAdvice: { recommended: 3800, position: 'below_market', diffPercent: -8 },
        riskLevel: 'low',
        bookingProbability: 0.72,
      },
    ],
    recommendations: ['Добавьте больше фотографий'],
    recentBookings: [],
  }
}
