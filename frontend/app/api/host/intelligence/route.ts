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

    const response = await fetch(getBackendUrl('/host/intelligence'), {
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
    console.error('Host intelligence API error:', error)
    
    return NextResponse.json({
      summary: {
        totalListings: 3,
        revenueForecast: 125000,
        occupancyForecast: 0.68,
        riskLevel: 'low',
        overallHealth: 'good',
        avgQuality: 72,
        avgDemand: 65,
      },
      properties: [
        {
          listingId: 'mock-1',
          title: 'Уютная студия в центре',
          city: 'Москва',
          currentPrice: 3500,
          status: 'PUBLISHED',
          intelligence: {
            qualityScore: 78,
            demandScore: 72,
            riskScore: 25,
            riskLevel: 'low',
            bookingProbability: 0.72,
            recommendedPrice: 3800,
            priceDeltaPercent: 8,
            marketPosition: 'below_market',
          },
          explanation: {
            text: 'Хорошее объявление с высоким потенциалом',
            bullets: ['Отличные фото', 'Выгодная цена'],
            suggestions: ['Добавьте больше удобств'],
          },
        },
      ],
      recommendations: ['Добавьте больше фотографий'],
    })
  }
}
