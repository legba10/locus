export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server'
import { backendGetJson } from '@/shared/utils/backend'

interface AiSearchRequest {
  city?: string
  priceMin?: number
  priceMax?: number
  type?: string
  rooms?: number
  area?: number
}

interface AiSearchResponse {
  listings: Array<{
    id: string
    score: number
    reason: string
  }>
  reason: string
  score: number
}

/**
 * AI Search API
 * 
 * Формула расчета AI score:
 * - город = +30%
 * - бюджет = +30%
 * - тип жилья = +20%
 * - площадь/комнаты = +10%
 * - популярность = +10%
 */
export async function POST(req: NextRequest) {
  try {
    const body: AiSearchRequest = await req.json()
    
    // Получаем все объявления
    const searchParams = new URLSearchParams()
    if (body.city) searchParams.set('city', body.city)
    if (body.priceMin) searchParams.set('priceMin', String(body.priceMin))
    if (body.priceMax) searchParams.set('priceMax', String(body.priceMax))
    if (body.type) searchParams.set('type', body.type)
    if (body.rooms) searchParams.set('rooms', String(body.rooms))

    let listings: any[] = []
    
    try {
      const data = await backendGetJson<{ items: any[] }>(`/api/v1/search?${searchParams.toString()}`)
      listings = data.items || []
    } catch (error) {
      // Если backend недоступен, используем mock данные
      console.warn('Backend unavailable, using mock data for AI search')
      listings = getMockListings()
    }

    // Рассчитываем AI score для каждого объявления
    const scoredListings = listings.map(listing => {
      let score = 0
      const reasons: string[] = []

      // Город = +30%
      if (body.city && listing.city?.toLowerCase() === body.city.toLowerCase()) {
        score += 30
        reasons.push('Подходит по городу')
      }

      // Бюджет = +30%
      if (body.priceMax && listing.basePrice <= body.priceMax) {
        const budgetMatch = (1 - (listing.basePrice / body.priceMax)) * 30
        score += budgetMatch
        if (budgetMatch > 20) {
          reasons.push('Вписывается в бюджет')
        }
      }

      // Тип жилья = +20%
      if (body.type && listing.type === body.type) {
        score += 20
        reasons.push('Подходит по типу жилья')
      }

      // Площадь/комнаты = +10%
      if (body.rooms && listing.bedrooms === Number(body.rooms)) {
        score += 10
        reasons.push('Подходит по количеству комнат')
      }

      // Популярность = +10% (на основе views или qualityScore)
      const popularity = Math.min(10, (listing.views || 0) / 100)
      score += popularity
      if (popularity > 5) {
        reasons.push('Популярное объявление')
      }

      // Нормализуем score до 0-100
      score = Math.min(100, Math.max(0, score))

      return {
        id: listing.id,
        score: Math.round(score),
        reason: reasons.length > 0 ? reasons[0] : 'Стандартный вариант',
        reasons: reasons.slice(0, 2)
      }
    })

    // Сортируем по score
    scoredListings.sort((a, b) => b.score - a.score)

    // Генерируем общее объяснение
    const topListing = scoredListings[0]
    const overallReason = topListing 
      ? `Подходит по ${topListing.reasons.join(', ').toLowerCase()}`
      : 'Найдены варианты по вашим параметрам'

    return NextResponse.json({
      listings: scoredListings,
      reason: overallReason,
      score: topListing?.score || 0
    } as AiSearchResponse)
  } catch (error: any) {
    console.error('AI search error:', error)
    return NextResponse.json(
      { error: 'AI search failed', message: error.message },
      { status: 500 }
    )
  }
}

function getMockListings() {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `listing-${i + 1}`,
    city: ['Москва', 'Санкт-Петербург', 'Казань'][i % 3],
    basePrice: 30000 + i * 2000,
    type: ['apartment', 'room', 'studio'][i % 3],
    bedrooms: (i % 3) + 1,
    views: 100 + i * 50,
  }))
}
