/**
 * LOCUS Listing Adapter
 * 
 * ARCHITECTURE LOCK:
 * Converts ANY API response to domain Listing model.
 * 
 * RULES:
 * - All API data MUST pass through adapter before UI use
 * - Adapter handles missing/invalid data gracefully
 * - Never throw, always return valid domain object
 */

import type {
  Listing,
  ListingCard,
  ListingDetail,
  ListingMedia,
  ListingStatus,
  ListingType,
  ListingIntelligence,
  MediaStorage,
} from '../domain/listing.model'
import { detectMediaType } from '../utils/mediaResolver'
import { logger } from '../utils/logger'

/**
 * Raw API listing (any shape from backend)
 */
interface RawApiListing {
  id?: string
  title?: string
  description?: string
  city?: string
  district?: string
  address?: string
  addressLine?: string
  price?: number
  basePrice?: number
  pricePerNight?: number
  currency?: string
  type?: string
  rooms?: number
  bedrooms?: number
  area?: number
  floor?: number
  totalFloors?: number
  status?: string
  views?: number
  createdAt?: string
  updatedAt?: string
  ownerId?: string
  userId?: string
  photos?: Array<{ url?: string; sortOrder?: number; alt?: string }>
  images?: Array<{ url?: string; sortOrder?: number; alt?: string }>
  media?: ListingMedia[]
  intelligence?: any
  aiScores?: any
  score?: number
  verdict?: string
  reasons?: string[]
  [key: string]: unknown
}

/**
 * Convert storage type from URL
 */
function resolveStorage(url: string | null | undefined): MediaStorage {
  const type = detectMediaType(url)
  switch (type) {
    case 'supabase': return 'supabase'
    case 'external': return 'external'
    default: return 'placeholder'
  }
}

/**
 * Adapt raw photo to ListingMedia
 */
function adaptPhoto(
  photo: { url?: string; sortOrder?: number; alt?: string } | null | undefined,
  index: number
): ListingMedia | null {
  if (!photo?.url) return null
  
  return {
    id: `photo-${index}`,
    url: photo.url,
    storage: resolveStorage(photo.url),
    alt: photo.alt,
    sortOrder: photo.sortOrder ?? index,
    isMain: index === 0,
  }
}

/**
 * Adapt photos array
 */
function adaptPhotos(raw: RawApiListing): ListingMedia[] {
  // Try different photo field names
  const photos = raw.media || raw.photos || raw.images || []
  
  const adapted = photos
    .map((p, i) => adaptPhoto(p, i))
    .filter((p): p is ListingMedia => p !== null)
  
  // If no photos, return placeholder
  if (adapted.length === 0) {
    return [{
      id: 'placeholder',
      url: '/placeholder.svg',
      storage: 'placeholder',
      isMain: true,
      sortOrder: 0,
    }]
  }
  
  return adapted
}

/**
 * Adapt price (different field names)
 */
function adaptPrice(raw: RawApiListing): number {
  return raw.price ?? raw.basePrice ?? raw.pricePerNight ?? 0
}

/**
 * Adapt listing type
 */
function adaptType(raw: RawApiListing): ListingType {
  const type = raw.type?.toLowerCase()
  if (type === 'apartment' || type === 'room' || type === 'house' || type === 'studio') {
    return type
  }
  return 'apartment'
}

/**
 * Adapt status
 */
function adaptStatus(raw: RawApiListing): ListingStatus {
  const status = raw.status?.toLowerCase()
  if (status === 'draft' || status === 'published' || status === 'archived' || status === 'deleted') {
    return status
  }
  return 'published'
}

/**
 * Adapt intelligence/AI data
 */
function adaptIntelligence(raw: RawApiListing): ListingIntelligence | undefined {
  const intel = raw.intelligence
  const score = intel?.qualityScore ?? raw.score ?? raw.aiScores?.qualityScore
  
  if (score === undefined) return undefined
  
  const demandScore = intel?.demandScore ?? raw.aiScores?.demandScore ?? 50
  const priceDelta = intel?.priceDeltaPercent ?? 0
  const riskScore = intel?.riskScore ?? raw.aiScores?.riskScore ?? 20
  
  return {
    score,
    verdict: raw.verdict ?? intel?.explanation?.text ?? getVerdictFromScore(score),
    reasons: raw.reasons ?? intel?.explanation?.bullets ?? [],
    demandLevel: demandScore >= 60 ? 'high' : demandScore >= 40 ? 'medium' : 'low',
    priceAnalysis: {
      marketPosition: priceDelta < -5 ? 'below' : priceDelta > 5 ? 'above' : 'at_market',
      diffPercent: priceDelta,
    },
    riskLevel: riskScore < 20 ? 'low' : riskScore < 40 ? 'medium' : 'high',
  }
}

/**
 * Get verdict from score
 */
function getVerdictFromScore(score: number): string {
  if (score >= 80) return 'Отличный вариант'
  if (score >= 65) return 'Хороший вариант'
  if (score >= 50) return 'Средний вариант'
  return 'Требует внимания'
}

/**
 * MAIN ADAPTER: Raw API → Listing domain model
 */
export function adaptListing(raw: RawApiListing): Listing {
  try {
    return {
      // Identity
      id: raw.id || 'unknown',
      userId: raw.userId || raw.ownerId || 'unknown',
      
      // Content
      title: raw.title || 'Без названия',
      description: raw.description,
      
      // Location
      city: raw.city || 'Не указан',
      district: raw.district,
      address: raw.address || raw.addressLine,
      
      // Price
      price: adaptPrice(raw),
      currency: (raw.currency as 'RUB' | 'USD' | 'EUR') || 'RUB',
      
      // Property
      type: adaptType(raw),
      rooms: raw.rooms ?? raw.bedrooms,
      area: raw.area,
      floor: raw.floor,
      totalFloors: raw.totalFloors,
      
      // Media
      media: adaptPhotos(raw),
      
      // Metadata
      status: adaptStatus(raw),
      views: raw.views,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt,
      
      // AI
      intelligence: adaptIntelligence(raw),
    }
  } catch (error) {
    logger.error('ListingAdapter', 'Failed to adapt listing', error)
    
    // Return minimal valid listing
    return {
      id: raw.id || 'error',
      userId: 'unknown',
      title: 'Ошибка загрузки',
      city: 'Неизвестно',
      price: 0,
      currency: 'RUB',
      type: 'apartment',
      media: [{
        id: 'placeholder',
        url: '/placeholder.svg',
        storage: 'placeholder',
        isMain: true,
        sortOrder: 0,
      }],
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
  }
}

/**
 * Adapt to ListingCard (for list views)
 */
export function adaptListingCard(raw: RawApiListing): ListingCard {
  const listing = adaptListing(raw)
  const intelligence = listing.intelligence
  
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    city: listing.city,
    district: listing.district,
    coverPhoto: listing.media[0] || null,
    rooms: listing.rooms,
    area: listing.area,
    views: listing.views,
    isNew: false, // Will be set by caller if needed
    isVerified: intelligence ? intelligence.score >= 70 : false,
    intelligence: intelligence ? {
      score: intelligence.score,
      verdict: intelligence.verdict,
      reasons: intelligence.reasons,
    } : undefined,
  }
}

/**
 * Adapt array of listings
 */
export function adaptListings(raw: RawApiListing[]): Listing[] {
  return raw.map(adaptListing)
}

/**
 * Adapt array to cards
 */
export function adaptListingCards(raw: RawApiListing[]): ListingCard[] {
  return raw.map(adaptListingCard)
}

export default {
  adaptListing,
  adaptListingCard,
  adaptListings,
  adaptListingCards,
}
