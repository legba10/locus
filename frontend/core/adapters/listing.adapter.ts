/**
 * Listing Data Adapter
 * 
 * Правило: UI никогда не зависит от "идеальных данных"
 * Все данные нормализуются перед использованием в UI
 */

export interface RawListing {
  id?: string
  title?: string
  description?: string
  city?: string
  address?: string
  district?: string
  addressLine?: string
  basePrice?: number
  price?: number
  pricePerNight?: number
  photos?: Array<{ url?: string }> | string[]
  images?: Array<{ url?: string }>
  amenities?: Array<{ amenity?: { label?: string; icon?: string } }> | Array<{ label?: string; icon?: string }>
  rooms?: number
  beds?: number
  bathrooms?: number
  score?: number
  verdict?: string
  explanation?: string
  demandLevel?: 'low' | 'medium' | 'high'
  reasons?: string[]
  // AI intelligence data
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
  aiScores?: {
    qualityScore?: number | null
    demandScore?: number | null
    riskScore?: number | null
    priceScore?: number | null
  } | null
  [key: string]: any
}

export interface NormalizedListing {
  id: string
  title: string
  description: string
  city: string
  address: string
  basePrice: number
  photos: Array<{ url: string }>
  amenities: Array<{ label: string; icon: string }>
  rooms: number
  beds: number
  bathrooms: number
  score: number
  verdict: string
  explanation: string
  demandLevel: 'low' | 'medium' | 'high'
  reasons: string[]
  priceDiff: number
  riskLevel: 'low' | 'medium' | 'high'
  bookingProbability: number
  recommendedPrice: number
}

/**
 * Calculate score from AI data
 */
function calculateScore(raw: RawListing): number {
  // If score is directly provided
  if (raw.score && raw.score > 0) return raw.score
  
  const intel = raw.intelligence
  const aiScores = raw.aiScores
  
  if (intel) {
    return Math.round(
      (intel.qualityScore || 50) * 0.4 +
      (intel.demandScore || 50) * 0.3 +
      (100 - (intel.riskScore || 50)) * 0.2 +
      (intel.completenessScore || 50) * 0.1
    )
  }
  
  if (aiScores?.qualityScore) {
    return aiScores.qualityScore
  }
  
  return 0
}

/**
 * Generate verdict from score
 */
function getVerdict(score: number, raw: RawListing): string {
  if (raw.verdict && raw.verdict !== 'Нет оценки') return raw.verdict
  
  if (score === 0) return 'Оценка формируется'
  if (score >= 80) return 'Отличный вариант'
  if (score >= 65) return 'Хороший вариант'
  if (score >= 50) return 'Средний вариант'
  return 'Требует внимания'
}

/**
 * Generate reasons from AI data
 */
function generateReasons(raw: RawListing, score: number): string[] {
  if (raw.reasons && raw.reasons.length > 0) return raw.reasons.slice(0, 3)
  
  const reasons: string[] = []
  const intel = raw.intelligence
  
  if (intel?.priceDeltaPercent !== undefined) {
    if (intel.priceDeltaPercent < -5) {
      reasons.push(`Цена ниже рынка на ${Math.abs(Math.round(intel.priceDeltaPercent))}%`)
    } else if (intel.priceDeltaPercent > 10) {
      reasons.push(`Цена выше рынка на ${Math.round(intel.priceDeltaPercent)}%`)
    }
  }
  
  if (intel?.demandScore !== undefined) {
    if (intel.demandScore >= 60) reasons.push('Высокий спрос')
    else if (intel.demandScore < 40) reasons.push('Низкий спрос')
  }
  
  if (intel?.riskLevel === 'low') reasons.push('Низкий риск')
  
  if (intel?.explanation?.bullets) {
    reasons.push(...intel.explanation.bullets.slice(0, 2))
  }
  
  // Default reasons if empty
  if (reasons.length === 0) {
    if (score === 0) reasons.push('Данных недостаточно')
    else if (score >= 70) reasons.push('Качественное объявление')
    else reasons.push('Стандартный вариант')
  }
  
  return reasons.slice(0, 3)
}

/**
 * Generate explanation text
 */
function generateExplanation(raw: RawListing): string {
  if (raw.explanation) return raw.explanation
  
  const intel = raw.intelligence
  if (intel?.explanation?.text) return intel.explanation.text
  
  const parts: string[] = []
  
  if (intel?.priceDeltaPercent !== undefined) {
    if (intel.priceDeltaPercent < -5) parts.push('Цена ниже рынка')
    else if (intel.priceDeltaPercent > 5) parts.push('Цена выше рынка')
  }
  
  if (intel?.demandScore !== undefined && intel.demandScore >= 60) {
    parts.push('Высокий спрос')
  }
  
  return parts.join(' · ') || ''
}

/**
 * Normalize listing data
 */
export function normalizeListing(raw: RawListing): NormalizedListing {
  // Normalize photos from multiple sources
  let photos: Array<{ url: string }> = []
  
  if (Array.isArray(raw.photos)) {
    photos = raw.photos
      .map(p => {
        if (typeof p === 'string') return { url: p }
        return { url: p?.url || '' }
      })
      .filter(p => p.url)
  } else if (Array.isArray(raw.images)) {
    photos = raw.images
      .map(p => ({ url: p?.url || '' }))
      .filter(p => p.url)
  }

  // Normalize amenities
  const amenities = Array.isArray(raw.amenities)
    ? raw.amenities
        .map(a => {
          // Handle nested amenity structure
          const amenity = (a as any)?.amenity || a
          return {
            label: amenity?.label || amenity?.key || 'Удобство',
            icon: amenity?.icon || '✓',
          }
        })
        .filter(a => a.label)
    : []

  // Calculate score
  const score = calculateScore(raw)
  
  // Get AI data
  const intel = raw.intelligence
  
  return {
    id: raw.id || '',
    title: raw.title || 'Без названия',
    description: raw.description || '',
    city: raw.city || 'Не указан',
    address: raw.address || raw.district || raw.addressLine || '',
    basePrice: raw.basePrice ?? raw.price ?? raw.pricePerNight ?? 0,
    photos: photos.length > 0 ? photos : [],
    amenities,
    rooms: raw.rooms ?? 0,
    beds: raw.beds ?? 0,
    bathrooms: raw.bathrooms ?? 0,
    score,
    verdict: getVerdict(score, raw),
    explanation: generateExplanation(raw),
    demandLevel: raw.demandLevel || (intel?.demandScore && intel.demandScore >= 60 ? 'high' : intel?.demandScore && intel.demandScore < 40 ? 'low' : 'medium'),
    reasons: generateReasons(raw, score),
    priceDiff: intel?.priceDeltaPercent ?? 0,
    riskLevel: (intel?.riskLevel as 'low' | 'medium' | 'high') || 'medium',
    bookingProbability: intel?.bookingProbability ?? 0.5,
    recommendedPrice: intel?.recommendedPrice ?? raw.basePrice ?? 0,
  }
}

/**
 * Normalize multiple listings
 */
export function normalizeListings(raw: RawListing[]): NormalizedListing[] {
  return raw.map(normalizeListing)
}

/**
 * Safe getter for nested properties
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue
    }
    current = current[key]
  }
  
  return current != null ? current : defaultValue
}
