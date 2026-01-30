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

export async function GET(req: Request) {
  try {
    const apiBaseUrl = getApiBaseUrl()
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

    const response = await fetch(`${apiBaseUrl}/owner/insight`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json(getMockData())
  } catch (error) {
    console.error('Owner insight API error:', error)
    return NextResponse.json(getMockData())
  }
}

function getMockData() {
  return {
    listings: [
      {
        id: 'mock-1',
        title: 'Уютная студия в центре Москвы',
        insight: {
          score: 82,
          verdict: 'excellent',
          verdictText: 'Отличный вариант',
          pros: ['Много качественных фотографий', 'Подробное описание'],
          cons: [],
          risks: [],
          pricePosition: 'below_market',
          priceText: 'Ниже рынка на 8%',
          recommendedPrice: 3800,
          demandLevel: 'high',
          demandText: 'Высокий спрос',
          bookingProbability: 78,
          recommendation: 'Отличное объявление!',
          tips: ['Добавьте фото окрестностей'],
          monthlyRevenueForecast: 68000,
          potentialGrowth: [{ action: 'Повысьте цену на 8%', impact: 'Увеличение дохода', percentIncrease: 8 }],
        },
      },
    ],
  }
}
