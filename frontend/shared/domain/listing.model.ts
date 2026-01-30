/**
 * LOCUS Domain Model — Listing
 * 
 * ARCHITECTURE LOCK:
 * This is the SINGLE SOURCE OF TRUTH for listing data structure.
 * All API responses MUST be adapted to this model before use in UI.
 * 
 * DO NOT:
 * - Use raw API data in components
 * - Add fields without updating adapter
 * - Import API types directly in UI
 */

/**
 * Media storage type
 */
export type MediaStorage = 'supabase' | 'external' | 'placeholder'

/**
 * Listing media (photo/video)
 */
export interface ListingMedia {
  id: string
  url: string
  storage: MediaStorage
  alt?: string
  isMain?: boolean
  sortOrder?: number
}

/**
 * Listing status
 */
export type ListingStatus = 'draft' | 'published' | 'archived' | 'deleted'

/**
 * Listing type
 */
export type ListingType = 'apartment' | 'room' | 'house' | 'studio'

/**
 * AI Intelligence data
 */
export interface ListingIntelligence {
  score: number
  verdict: string
  reasons: string[]
  demandLevel: 'low' | 'medium' | 'high'
  priceAnalysis: {
    marketPosition: 'below' | 'at_market' | 'above'
    diffPercent: number
  }
  riskLevel: 'low' | 'medium' | 'high'
}

/**
 * Core Listing domain model
 */
export interface Listing {
  // Identity
  id: string
  userId: string
  
  // Content
  title: string
  description?: string
  
  // Location
  city: string
  district?: string
  address?: string
  
  // Price
  price: number
  currency: 'RUB' | 'USD' | 'EUR'
  
  // Property details
  type: ListingType
  rooms?: number
  area?: number
  floor?: number
  totalFloors?: number
  
  // Media
  media: ListingMedia[]
  
  // Metadata
  status: ListingStatus
  views?: number
  createdAt: string
  updatedAt?: string
  
  // AI (optional)
  intelligence?: ListingIntelligence
}

/**
 * Listing for list/card display (subset of full listing)
 */
export interface ListingCard {
  id: string
  title: string
  price: number
  city: string
  district?: string
  coverPhoto: ListingMedia | null
  rooms?: number
  area?: number
  views?: number
  isNew?: boolean
  isVerified?: boolean
  intelligence?: Pick<ListingIntelligence, 'score' | 'verdict' | 'reasons'>
}

/**
 * Listing for detail page (full data)
 */
export interface ListingDetail extends Listing {
  // Owner info (public)
  owner?: {
    id: string
    name?: string
    avatar?: string
    responseRate?: number
  }
  
  // Amenities
  amenities?: string[]
  
  // Reviews summary
  reviewsSummary?: {
    averageRating: number
    totalReviews: number
  }
}

/**
 * Type guards
 */
export function isListingMedia(obj: unknown): obj is ListingMedia {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ListingMedia).id === 'string' &&
    typeof (obj as ListingMedia).url === 'string' &&
    ['supabase', 'external', 'placeholder'].includes((obj as ListingMedia).storage)
  )
}

export function isListing(obj: unknown): obj is Listing {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Listing).id === 'string' &&
    typeof (obj as Listing).title === 'string' &&
    typeof (obj as Listing).price === 'number'
  )
}
