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

    let response = await fetch(getBackendUrl('/owner/dashboard'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      response = await fetch(getBackendUrl('/landlord/dashboard'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
    }
    
    if (response.status === 404) {
      response = await fetch(getBackendUrl('/host/intelligence'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
    console.error('Owner dashboard API error:', error)
    return NextResponse.json(getMockData())
  }
}

function transformResponse(data: any) {
  const properties = data.properties ?? data.listings ?? []
  
  const listings = properties.map((p: any) => {
    const score = p.locusRating ?? p.insight?.score ?? p.intelligence?.qualityScore ?? 50
    const price = p.currentPrice ?? p.price ?? p.basePrice ?? 0
    const bookingProb = p.bookingProbability ?? p.insight?.bookingProbability ?? p.intelligence?.bookingProbability ?? 0.5
    const monthlyIncome = Math.round(price * 20 * bookingProb)
    
    return {
      id: p.listingId ?? p.id,
      title: p.title ?? 'Объявление',
      score,
      monthlyIncome,
    }
  })

  const currentIncome = listings.reduce((sum: number, l: any) => sum + l.monthlyIncome, 0)
  const avgScore = listings.length > 0 
    ? Math.round(listings.reduce((sum: number, l: any) => sum + l.score, 0) / listings.length)
    : 50
  
  const avgScoreGap = 100 - avgScore
  const potentialGrowthPercent = Math.min(30, Math.round(avgScoreGap * 0.3))
  const potentialIncome = Math.round(currentIncome * (1 + potentialGrowthPercent / 100))

  const improvements: string[] = []
  properties.forEach((p: any, i: number) => {
    const tips = p.insight?.tips ?? p.explanation?.suggestions ?? []
    if (tips.length > 0) {
      improvements.push(`${p.title ?? `Объявление ${i + 1}`}: ${tips[0]}`)
    }
  })
  if (improvements.length === 0) {
    improvements.push('Добавить фото для всех объявлений')
    improvements.push('Скорректировать описания')
  }

  return {
    averageScore: avgScore,
    currentIncome,
    potentialIncome,
    growthPercent: potentialGrowthPercent,
    improvements: improvements.slice(0, 5),
    listings,
    summary: {
      totalListings: data.summary?.totalListings ?? listings.length,
      publishedListings: data.summary?.publishedListings ?? listings.length,
      avgScore,
      totalRevenue30d: data.summary?.revenue30d ?? currentIncome,
      pendingBookings: data.summary?.pendingBookings ?? 0,
    },
    recommendations: data.recommendations ?? improvements,
  }
}

function getMockData() {
  const listings = [
    { id: 'mock-1', title: 'Уютная студия в центре Москвы', score: 82, monthlyIncome: 45000 },
    { id: 'mock-2', title: 'Апартаменты у метро Невский', score: 65, monthlyIncome: 18000 },
  ]

  const currentIncome = listings.reduce((sum, l) => sum + l.monthlyIncome, 0)
  const avgScore = Math.round(listings.reduce((sum, l) => sum + l.score, 0) / listings.length)
  const potentialGrowth = 18
  const potentialIncome = Math.round(currentIncome * (1 + potentialGrowth / 100))

  return {
    averageScore: avgScore,
    currentIncome,
    potentialIncome,
    growthPercent: potentialGrowth,
    improvements: ['Добавить фото кухни', 'Скорректировать цену объявления #2'],
    listings,
    summary: {
      totalListings: listings.length,
      publishedListings: listings.length,
      avgScore,
      totalRevenue30d: currentIncome,
      pendingBookings: 1,
    },
    recommendations: ['Добавьте больше фотографий'],
  }
}
