export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import type { Listing, ListingBadge, ListingImage, EnrichedListing } from '@/domains/listing'
import { backendGetJson } from '@/shared/utils/backend'

type BackendSearchItem = {
  id: string
  title: string
  city: string
  addressLine?: string
  description?: string
  basePrice: number
  currency: 'USD' | 'EUR' | 'RUB' | string
  ownerId: string
  createdAt: string
  photos?: Array<{ url: string; sortOrder: number }>
  aiScores?: { 
    qualityScore?: number | null
    demandScore?: number | null
    riskScore?: number | null
    priceScore?: number | null
  } | null
  intelligence?: {
    qualityScore?: number
    demandScore?: number
    riskScore?: number
    completenessScore?: number
    bookingProbability?: number
    recommendedPrice?: number
    priceDeltaPercent?: number
    marketPosition?: string
    riskLevel?: string
    explanation?: { text?: string; bullets?: string[]; suggestions?: string[] } | null
  } | null
}

type BackendSearchResponse = { items: BackendSearchItem[]; ai?: unknown }

/**
 * Generate verdict from score
 */
function getVerdict(score: number): string {
  if (score >= 80) return 'Отличный вариант'
  if (score >= 65) return 'Хороший вариант'
  if (score >= 50) return 'Средний вариант'
  return 'Требует внимания'
}

/**
 * Generate demand level label
 */
function getDemandLevel(demandScore: number | null | undefined): 'low' | 'medium' | 'high' {
  if (!demandScore) return 'medium'
  if (demandScore >= 60) return 'high'
  if (demandScore >= 40) return 'medium'
  return 'low'
}

/**
 * Generate explanation text from AI data
 */
function getExplanation(item: BackendSearchItem): string {
  const intel = item.intelligence
  if (!intel) return ''
  
  const parts: string[] = []
  
  if (intel.priceDeltaPercent !== undefined) {
    if (intel.priceDeltaPercent < -5) parts.push('Цена ниже рынка')
    else if (intel.priceDeltaPercent > 5) parts.push('Цена выше рынка')
    else parts.push('Цена по рынку')
  }
  
  if (intel.demandScore !== undefined) {
    if (intel.demandScore >= 60) parts.push('Высокий спрос')
    else if (intel.demandScore < 40) parts.push('Низкий спрос')
  }
  
  if (intel.riskLevel === 'low') parts.push('Низкий риск')
  
  return parts.join(' · ')
}

function toListing(item: BackendSearchItem): EnrichedListing {
  const coverUrl = item.photos?.[0]?.url
  const images: ListingImage[] = coverUrl ? [{ url: coverUrl, alt: item.title }] : []

  const badges: ListingBadge[] = []
  const quality = item.aiScores?.qualityScore ?? item.intelligence?.qualityScore ?? null
  if (quality != null && quality >= 85) badges.push('SUPERHOST')
  if (Date.now() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) badges.push('NEW')

  // Calculate combined score
  const intel = item.intelligence
  const aiScores = item.aiScores
  let score = 50 // default
  
  if (intel) {
    score = Math.round(
      (intel.qualityScore || 50) * 0.4 +
      (intel.demandScore || 50) * 0.3 +
      (100 - (intel.riskScore || 50)) * 0.2 +
      (intel.completenessScore || 50) * 0.1
    )
  } else if (aiScores?.qualityScore) {
    score = aiScores.qualityScore
  }

  // Generate reasons from AI data
  const reasons: string[] = []
  if (intel?.priceDeltaPercent !== undefined && intel.priceDeltaPercent < -5) {
    reasons.push(`Цена ниже рынка на ${Math.abs(Math.round(intel.priceDeltaPercent))}%`)
  }
  if (intel?.demandScore && intel.demandScore >= 60) {
    reasons.push('Высокий спрос в районе')
  }
  if (intel?.riskLevel === 'low') {
    reasons.push('Низкий риск')
  }
  if (intel?.explanation?.bullets) {
    reasons.push(...intel.explanation.bullets.slice(0, 2))
  }
  
  // Default reasons if empty
  if (reasons.length === 0) {
    if (score >= 70) reasons.push('Качественное объявление')
    else reasons.push('Стандартный вариант')
  }

  return {
    id: item.id,
    title: item.title,
    city: item.city,
    pricePerNight: item.basePrice,
    basePrice: item.basePrice,
    currency: (item.currency as Listing['currency']) ?? 'RUB',
    rating: 0,
    reviewCount: 0,
    badges,
    images,
    hostId: item.ownerId,
    // AI-enriched fields
    score,
    aiScore: score, // Добавляем aiScore для совместимости
    verdict: getVerdict(score),
    explanation: getExplanation(item),
    demandLevel: getDemandLevel(intel?.demandScore ?? aiScores?.demandScore),
    district: item.addressLine,
    reasons: reasons.slice(0, 3),
    aiReasons: reasons.slice(0, 3), // Добавляем aiReasons для совместимости
    // Дополнительные поля
    createdAt: item.createdAt,
  }
}

/**
 * Тестовые данные для демонстрации
 */
/**
 * MOCK DATA - DEVELOPMENT ONLY
 * In production, returns empty array. Backend must provide real data.
 * NO unsplash, picsum, or random URLs allowed.
 */
function getMockListings(): BackendSearchItem[] {
  // PRODUCTION: No mock data allowed
  if (process.env.NODE_ENV !== 'development') {
    return []
  }

  // DEVELOPMENT ONLY: Deterministic mock data for testing
  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Сочи']
  const titles = [
    'Уютная квартира в центре',
    'Современная студия у метро',
    'Просторная квартира с видом',
    'Комната в центре города',
    'Квартира для длительной аренды',
    'Светлая студия в новостройке',
  ]

  // Use deterministic values (no Math.random)
  return titles.map((title, index) => {
    const city = cities[index % cities.length]
    // Deterministic price based on index
    const basePrice = 25000 + (index * 5000)
    const qualityScore = 60 + (index * 5) % 30
    const demandScore = 50 + (index * 7) % 40
    const riskScore = 10 + (index * 3) % 30
    const priceDelta = -10 + (index * 5) % 20
    
    return {
      id: `mock-${index + 1}`,
      title,
      city,
      addressLine: `${city}, район ${index % 3 === 0 ? 'Центральный' : index % 3 === 1 ? 'Северный' : 'Южный'}`,
      description: `${title}. Удобное расположение, хорошая транспортная доступность.`,
      basePrice,
      currency: 'RUB',
      ownerId: `owner-${index + 1}`,
      // Deterministic date (no Date.now() or Math.random())
      createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
      // NO mock images - must come from Supabase Storage
      photos: [],
      intelligence: {
        qualityScore,
        demandScore,
        riskScore,
        completenessScore: 70 + (index * 3) % 20,
        bookingProbability: 0.5 + (index * 0.05) % 0.3,
        recommendedPrice: basePrice * (1 + priceDelta / 100),
        priceDeltaPercent: priceDelta,
        marketPosition: priceDelta < -5 ? 'below' : priceDelta > 5 ? 'above' : 'average',
        riskLevel: riskScore < 20 ? 'low' : riskScore < 40 ? 'medium' : 'high',
        explanation: {
          text: `Качественное объявление с хорошими показателями`,
          bullets: [
            priceDelta < -5 ? `Цена ниже рынка на ${Math.abs(priceDelta)}%` : 'Цена по рынку',
            demandScore >= 60 ? 'Высокий спрос в районе' : 'Средний спрос',
            riskScore < 20 ? 'Низкий риск' : 'Стандартный риск',
          ],
          suggestions: []
        }
      },
      aiScores: {
        qualityScore,
        demandScore,
        riskScore,
        priceScore: 50 + (index * 5) % 30
      }
    }
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)

  // Frontend query params (legacy UI contract)
  const city = url.searchParams.get('city') ?? undefined
  const guests = url.searchParams.get('guests') ?? undefined
  const priceMax = url.searchParams.get('priceMax') ?? undefined
  const priceMin = url.searchParams.get('priceMin') ?? undefined
  const q = url.searchParams.get('q') ?? undefined
  const ai = url.searchParams.get('ai') ?? undefined
  const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined

  // Map to backend: /api/v1/search
  const backendQs = new URLSearchParams()
  if (city) backendQs.set('city', city)
  if (guests) backendQs.set('guests', guests)
  if (priceMax) backendQs.set('priceMax', priceMax)
  if (priceMin) backendQs.set('priceMin', priceMin)
  if (q) backendQs.set('q', q)
  if (ai) backendQs.set('ai', ai)

  let data: BackendSearchResponse
  
  try {
    data = await backendGetJson<BackendSearchResponse>(`/search${backendQs.toString() ? `?${backendQs.toString()}` : ""}`);
    if (!data.items || data.items.length === 0) {
      data = { items: getMockListings(), ai: null };
    }
  } catch (error) {
    console.warn("[API] Backend unavailable:", error);
    // Production: no mock; return empty. Development: allow mock.
    if (process.env.NODE_ENV === "production") {
      data = { items: [], ai: null };
    } else {
      data = { items: getMockListings(), ai: null };
    }
  }

  // Фильтруем по городу, если указан
  let filteredItems = data.items
  if (city) {
    filteredItems = filteredItems.filter(item => 
      item.city.toLowerCase().includes(city.toLowerCase())
    )
  }

  const mapped = filteredItems.map(toListing)
  const items = limit ? mapped.slice(0, limit) : mapped

  return NextResponse.json({ items, ai: data.ai })
}

