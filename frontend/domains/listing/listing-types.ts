import type {
  ListingContract,
  EnrichedListingContract,
  ListingBadge as ListingBadgeContract,
  ListingImage as ListingImageContract,
  ListingAiScores as ListingAiScoresContract,
  DemandLevel,
} from "@/shared/contracts";

export type ListingId = string

export type ListingBadge = ListingBadgeContract

export type ListingImage = ListingImageContract

export type ListingAiScores = ListingAiScoresContract & {
  priceScore?: number | null
}

/**
 * Базовый тип Listing, совместимый с ListingContract
 */
export type Listing = ListingContract & {
  basePrice?: number
  createdAt?: string
}

/**
 * Listing с AI-обогащением
 */
export type EnrichedListing = EnrichedListingContract

export type { DemandLevel }

export type ListingIntelligence = {
  qualityScore: number
  demandScore: number
  riskScore: number
  riskLevel: string
  bookingProbability: number
  recommendedPrice: number
  priceDeltaPercent: number
  marketPosition: string
  explanation: {
    text: string
    bullets: string[]
    suggestions: string[]
  }
}

export type ListingDetail = Listing & {
  description: string
  amenities: string[]
  photos: ListingImage[]
  addressLine?: string
  lat?: number
  lng?: number
  capacityGuests?: number
  bedrooms?: number
  beds?: number
  bathrooms?: number
  intelligence?: ListingIntelligence
}

export type ListingSearchQuery = {
  city?: string
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
  guests?: number
  priceMin?: number
  priceMax?: number
  q?: string
}

