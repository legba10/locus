export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import type { ListingBadge, ListingDetail, ListingImage, ListingIntelligence } from '@/domains/listing'
import { backendGetJson } from '@/shared/utils/backend'

interface BackendListing {
  id: string
  title: string
  city: string
  description: string
  addressLine?: string
  lat?: number
  lng?: number
  basePrice: number
  currency: 'USD' | 'EUR' | 'RUB' | string
  capacityGuests?: number
  bedrooms?: number
  beds?: number
  bathrooms?: number
  ownerId: string
  createdAt: string
  photos?: Array<{ url: string; sortOrder: number }>
  amenities?: Array<{ amenity: { key: string; label: string } }>
  aiScores?: { qualityScore?: number | null; demandScore?: number | null; riskScore?: number | null } | null
  intelligence?: {
    qualityScore: number
    demandScore: number
    riskScore: number
    completenessScore: number
    bookingProbability: number
    recommendedPrice: number
    priceDeltaPercent: number
    marketPosition: string
    riskLevel: string
    riskFactors: string[]
    explanation: {
      text: string
      bullets: string[]
      suggestions: string[]
    }
  } | null
  reviews?: Array<{ rating: number }>
}

/**
 * MOCK DATA - DEVELOPMENT ONLY
 * NO unsplash, picsum, or random values allowed.
 * In production, if backend fails, return 404.
 */
function getMockListing(id: string): BackendListing | null {
  // PRODUCTION: No mock data
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // DEVELOPMENT ONLY: Deterministic mock data
  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Сочи']
  const titles = [
    'Уютная квартира в центре',
    'Современная студия у метро',
    'Просторная квартира с видом',
    'Комната в центре города',
    'Квартира для длительной аренды',
    'Светлая студия в новостройке',
  ]
  
  const index = id.includes('mock-') ? parseInt(id.replace('mock-', '')) - 1 : 0
  const city = cities[index % cities.length]
  // Deterministic values (no Math.random)
  const basePrice = 25000 + (index * 5000)
  const qualityScore = 60 + (index * 5) % 30
  const demandScore = 50 + (index * 7) % 40
  const riskScore = 10 + (index * 3) % 30
  const priceDelta = -10 + (index * 5) % 20

  return {
    id,
    title: titles[index % titles.length] || 'Квартира для аренды',
    city,
    description: `${titles[index % titles.length] || 'Квартира'} в ${city}. Удобное расположение, хорошая транспортная доступность. Современный ремонт, вся необходимая мебель и техника.`,
    addressLine: `${city}, район ${index % 3 === 0 ? 'Центральный' : index % 3 === 1 ? 'Северный' : 'Южный'}`,
    // Deterministic coordinates based on index
    lat: 55.7558 + (index * 0.01),
    lng: 37.6173 + (index * 0.01),
    basePrice,
    currency: 'RUB',
    capacityGuests: 2 + (index % 4),
    bedrooms: 1 + (index % 3),
    beds: 1 + (index % 3),
    bathrooms: 1,
    ownerId: `owner-${index + 1}`,
    // Deterministic date (no Date.now())
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    // NO mock images - must come from Supabase Storage
    photos: [],
    amenities: [
      { amenity: { key: 'wifi', label: 'WiFi' } },
      { amenity: { key: 'kitchen', label: 'Кухня' } },
      { amenity: { key: 'parking', label: 'Парковка' } },
    ],
    intelligence: {
      qualityScore,
      demandScore,
      riskScore,
      completenessScore: 70 + (index * 3) % 20,
      bookingProbability: 0.5 + (index * 0.05) % 0.3,
      recommendedPrice: basePrice * (1 + priceDelta / 100),
      priceDeltaPercent: priceDelta,
      marketPosition: priceDelta < -5 ? 'below' : priceDelta > 5 ? 'above' : 'at_market',
      riskLevel: riskScore < 20 ? 'low' : riskScore < 40 ? 'medium' : 'high',
      riskFactors: riskScore >= 40 ? ['Повышенный риск'] : [],
      explanation: {
        text: `Качественное объявление с хорошими показателями. ${priceDelta < -5 ? `Цена ниже рынка на ${Math.abs(priceDelta)}%` : 'Цена соответствует рынку'}.`,
        bullets: [
          priceDelta < -5 ? `Цена ниже рынка на ${Math.abs(priceDelta)}%` : 'Цена по рынку',
          demandScore >= 60 ? 'Высокий спрос в районе' : 'Средний спрос',
          riskScore < 20 ? 'Низкий риск' : 'Стандартный риск',
        ],
        suggestions: ['Рекомендуем забронировать заранее', 'Уточните наличие в выбранные даты']
      }
    },
    aiScores: {
      qualityScore,
      demandScore,
      riskScore,
    },
    // Deterministic reviews
    reviews: [
      { rating: 4.5 },
      { rating: 4.8 },
      { rating: 4.2 },
      { rating: 4.6 },
      { rating: 4.9 },
    ]
  }
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    let raw: { item: BackendListing }
    
    try {
      raw = await backendGetJson<{ item: BackendListing }>(
        `/listings/${encodeURIComponent(ctx.params.id)}`
      );
    } catch (error) {
      // PRODUCTION: Return 404 if backend fails
      // DEVELOPMENT: Use mock data for testing
      console.warn('Backend unavailable or listing not found:', error)
      const mockData = getMockListing(ctx.params.id)
      if (!mockData) {
        return NextResponse.json(
          { error: 'Listing not found', message: 'Backend unavailable' },
          { status: 404 }
        )
      }
      raw = { item: mockData }
    }

    const src = raw.item
    // Нормализуем URL изображений (поддержка Supabase и других источников)
    const photos: ListingImage[] =
      src.photos?.map((p) => {
        const url = p.url || ''
        // Если URL из Supabase, он уже валидный
        // Если нет, проверяем валидность
        return { url, alt: src.title }
      }).filter(p => p.url) ?? []
    const images = photos.length ? photos : []

    // Calculate rating from reviews
    const reviews = src.reviews ?? []
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 4.5 // Default rating

    // Build badges
    const badges: ListingBadge[] = []
    const quality = src.aiScores?.qualityScore ?? src.intelligence?.qualityScore ?? null
    if (quality != null && quality >= 85) badges.push('SUPERHOST')
    if (quality != null && quality >= 75) badges.push('AI_PICK')
    if (Date.now() - new Date(src.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) badges.push('NEW')

    // Map intelligence
    let intelligence: ListingIntelligence | undefined
    if (src.intelligence) {
      intelligence = {
        qualityScore: src.intelligence.qualityScore,
        demandScore: src.intelligence.demandScore,
        riskScore: src.intelligence.riskScore,
        riskLevel: src.intelligence.riskLevel,
        bookingProbability: src.intelligence.bookingProbability,
        recommendedPrice: src.intelligence.recommendedPrice,
        priceDeltaPercent: src.intelligence.priceDeltaPercent,
        marketPosition: src.intelligence.marketPosition,
        explanation: src.intelligence.explanation,
      }
    } else if (src.aiScores) {
      // Fallback to aiScores if intelligence not available
      intelligence = {
        qualityScore: src.aiScores.qualityScore ?? 0,
        demandScore: src.aiScores.demandScore ?? 50,
        riskScore: src.aiScores.riskScore ?? 30,
        riskLevel: (src.aiScores.riskScore ?? 30) >= 60 ? 'high' : (src.aiScores.riskScore ?? 30) >= 35 ? 'medium' : 'low',
        bookingProbability: 0.5,
        recommendedPrice: src.basePrice,
        priceDeltaPercent: 0,
        marketPosition: 'at_market',
        explanation: {
          text: 'AI анализ на основе базовых метрик.',
          bullets: [
            `Качество: ${src.aiScores.qualityScore ?? 0}/100`,
            `Спрос: ${src.aiScores.demandScore ?? 50}/100`,
          ],
          suggestions: ['Добавьте больше фотографий', 'Расширьте описание'],
        },
      }
    }

    const item: ListingDetail = {
      id: src.id,
      title: src.title,
      city: src.city,
      addressLine: src.addressLine,
      lat: src.lat,
      lng: src.lng,
      pricePerNight: src.basePrice,
      currency: (src.currency as ListingDetail['currency']) ?? 'RUB',
      capacityGuests: src.capacityGuests,
      bedrooms: src.bedrooms,
      beds: src.beds,
      bathrooms: src.bathrooms,
      rating: avgRating,
      reviewCount: reviews.length,
      badges,
      images,
      hostId: src.ownerId,
      description: src.description,
      amenities: (src.amenities ?? []).map((a) => a.amenity.label || a.amenity.key),
      photos,
      intelligence,
    }

    // Build decision object for UI
    let decision: any = null
    if (intelligence) {
      // Calculate combined score
      const score = Math.round(
        (intelligence.qualityScore || 50) * 0.4 +
        (intelligence.demandScore || 50) * 0.3 +
        (100 - (intelligence.riskScore || 50)) * 0.2 +
        50 * 0.1 // completeness baseline
      )

      // Generate verdict
      let verdict = 'Средний вариант'
      if (score >= 80) verdict = 'Отличный вариант'
      else if (score >= 65) verdict = 'Хороший вариант'
      else if (score < 50) verdict = 'Требует внимания'

      // Generate reasons
      const reasons: string[] = []
      if (intelligence.priceDeltaPercent < -5) {
        reasons.push(`Цена ниже рынка на ${Math.abs(Math.round(intelligence.priceDeltaPercent))}%`)
      }
      if (intelligence.demandScore >= 60) {
        reasons.push('Высокий спрос в районе')
      }
      if (intelligence.riskLevel === 'low') {
        reasons.push('Низкий риск')
      }
      if (intelligence.explanation?.bullets) {
        reasons.push(...intelligence.explanation.bullets.slice(0, 2))
      }
      if (reasons.length === 0) {
        reasons.push('Стандартный вариант')
      }

      // Generate risks
      const risks: string[] = []
      if (intelligence.priceDeltaPercent > 10) {
        risks.push(`Цена выше рынка на ${Math.round(intelligence.priceDeltaPercent)}%`)
      }
      if (intelligence.demandScore < 40) {
        risks.push('Низкий спрос в этом районе')
      }
      if (intelligence.riskLevel === 'high') {
        risks.push('Повышенный риск')
      }

      // Generate recommendation
      let recommendation = ''
      if (score >= 80) recommendation = 'Рекомендуем бронировать'
      else if (score >= 65) recommendation = 'Хороший выбор для аренды'
      else if (intelligence.priceDeltaPercent < -5) recommendation = 'Выгодная цена'
      else recommendation = intelligence.explanation?.suggestions?.[0] || ''

      decision = {
        score,
        verdict,
        reasons: reasons.slice(0, 3),
        risks: risks.slice(0, 2),
        priceDiff: intelligence.priceDeltaPercent,
        priceDiffPercent: intelligence.priceDeltaPercent,
        demandLevel: intelligence.demandScore >= 60 ? 'high' : intelligence.demandScore < 40 ? 'low' : 'medium',
        recommendation,
        mainAdvice: intelligence.explanation?.suggestions?.[0] || '',
      }
    }

    // Generate personalized reasons (simulated for MVP)
    const personalizedReasons = [
      'Цена в вашем диапазоне',
      `Удобная локация в ${src.city}`,
    ]

    return NextResponse.json({ item, decision, personalizedReasons })
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 500
    const code = status === 404 ? 'NOT_FOUND' : 'BACKEND_ERROR'
    return NextResponse.json({ error: code }, { status })
  }
}

