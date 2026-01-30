/**
 * LOCUS AI Intelligence Service
 * 
 * PATCH 5: AI Foundation
 * 
 * Provides AI-powered features (currently fake, architecture ready).
 * When real AI is added, only this service changes.
 */

import type { Listing, ListingCard, ListingIntelligence } from '../domain/listing.model'
import type { User } from '../domain/user.model'
import { logger } from '../utils/logger'

/**
 * Extended intelligence data for AI matching
 */
export interface ExtendedIntelligence extends ListingIntelligence {
  tags: string[]
  matchReasons: string[]
  similarListings: string[]
  recommendation: 'strong' | 'moderate' | 'weak' | 'none'
}

/**
 * User preferences for AI matching
 */
export interface UserPreferences {
  priceRange: { min: number; max: number }
  preferredCities: string[]
  preferredDistricts: string[]
  minRooms?: number
  maxRooms?: number
  minArea?: number
  maxArea?: number
  amenities?: string[]
  tags?: string[]
}

/**
 * AI Match result
 */
export interface AIMatchResult {
  listing: ListingCard
  score: number
  matchReasons: string[]
  intelligence: ExtendedIntelligence
}

/**
 * Price analysis result
 */
export interface PriceAnalysis {
  marketPosition: 'below' | 'at_market' | 'above'
  diffPercent: number
  suggestedPrice: number
  confidence: number
}

/**
 * Demand prediction
 */
export interface DemandPrediction {
  level: 'low' | 'medium' | 'high'
  trend: 'decreasing' | 'stable' | 'increasing'
  estimatedDaysToRent: number
  confidence: number
}

// ==========================================
// FAKE AI IMPLEMENTATIONS (replace with real AI)
// ==========================================

/**
 * Generate fake intelligence score (0-100)
 */
function fakeScore(listing: Partial<Listing>): number {
  let score = 50

  // Has photos +20
  if (listing.media && listing.media.length > 0) score += 20
  if (listing.media && listing.media.length >= 3) score += 10

  // Has description +10
  if (listing.description && listing.description.length > 50) score += 10

  // Has all details +10
  if (listing.rooms && listing.area) score += 10

  return Math.min(100, Math.max(0, score))
}

/**
 * Generate fake tags based on listing
 */
function fakeTags(listing: Partial<Listing>): string[] {
  const tags: string[] = []

  if (listing.rooms === 1) tags.push('Студия')
  if (listing.rooms && listing.rooms >= 3) tags.push('Семейное')
  if (listing.price && listing.price < 30000) tags.push('Бюджетное')
  if (listing.price && listing.price > 80000) tags.push('Премиум')
  if (listing.area && listing.area > 80) tags.push('Просторное')
  if (listing.floor === 1) tags.push('Первый этаж')
  if (listing.district?.toLowerCase().includes('центр')) tags.push('Центр')

  return tags
}

/**
 * Generate fake match reasons
 */
function fakeMatchReasons(
  listing: Partial<Listing>,
  preferences?: UserPreferences
): string[] {
  const reasons: string[] = []

  if (!preferences) {
    reasons.push('Популярное объявление')
    return reasons
  }

  if (listing.price && listing.price >= preferences.priceRange.min && 
      listing.price <= preferences.priceRange.max) {
    reasons.push('Подходит по бюджету')
  }

  if (listing.city && preferences.preferredCities.includes(listing.city)) {
    reasons.push('Предпочтительный город')
  }

  if (listing.rooms && preferences.minRooms && 
      listing.rooms >= preferences.minRooms) {
    reasons.push('Подходит по количеству комнат')
  }

  if (reasons.length === 0) {
    reasons.push('Рекомендуем посмотреть')
  }

  return reasons
}

/**
 * Fake price analysis
 */
function fakePriceAnalysis(listing: Partial<Listing>): PriceAnalysis {
  const price = listing.price || 50000
  const basePrice = 45000 // Fake market average
  const diff = ((price - basePrice) / basePrice) * 100

  return {
    marketPosition: diff < -10 ? 'below' : diff > 10 ? 'above' : 'at_market',
    diffPercent: Math.round(diff),
    suggestedPrice: basePrice,
    confidence: 0.7,
  }
}

/**
 * Fake demand prediction
 */
function fakeDemandPrediction(listing: Partial<Listing>): DemandPrediction {
  const score = fakeScore(listing)
  
  return {
    level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
    trend: 'stable',
    estimatedDaysToRent: score > 70 ? 7 : score > 40 ? 14 : 30,
    confidence: 0.6,
  }
}

// ==========================================
// PUBLIC API
// ==========================================

/**
 * Generate intelligence for listing
 */
export function generateIntelligence(listing: Partial<Listing>): ExtendedIntelligence {
  logger.debug('AI', 'Generating intelligence for listing', { id: listing.id })

  const score = fakeScore(listing)
  const priceAnalysis = fakePriceAnalysis(listing)
  const demand = fakeDemandPrediction(listing)

  return {
    score,
    verdict: score > 70 ? 'Отличное предложение' : 
             score > 40 ? 'Хороший вариант' : 'Требует внимания',
    reasons: fakeMatchReasons(listing),
    demandLevel: demand.level,
    priceAnalysis: {
      marketPosition: priceAnalysis.marketPosition,
      diffPercent: priceAnalysis.diffPercent,
    },
    riskLevel: 'low',
    tags: fakeTags(listing),
    matchReasons: [],
    similarListings: [],
    recommendation: score > 70 ? 'strong' : score > 40 ? 'moderate' : 'weak',
  }
}

/**
 * Match listings to user preferences
 */
export function matchListings(
  listings: ListingCard[],
  preferences: UserPreferences
): AIMatchResult[] {
  logger.debug('AI', 'Matching listings to preferences', { 
    count: listings.length 
  })

  return listings.map(listing => {
    const intelligence = generateIntelligence(listing as unknown as Listing)
    const matchReasons = fakeMatchReasons(listing as unknown as Listing, preferences)
    
    // Calculate match score based on preferences
    let matchScore = intelligence.score
    if (listing.price >= preferences.priceRange.min && 
        listing.price <= preferences.priceRange.max) {
      matchScore += 20
    }
    if (preferences.preferredCities.includes(listing.city)) {
      matchScore += 15
    }

    return {
      listing,
      score: Math.min(100, matchScore),
      matchReasons,
      intelligence: {
        ...intelligence,
        matchReasons,
      },
    }
  }).sort((a, b) => b.score - a.score)
}

/**
 * Analyze listing price
 */
export function analyzePrices(listing: Partial<Listing>): PriceAnalysis {
  logger.debug('AI', 'Analyzing price', { id: listing.id, price: listing.price })
  return fakePriceAnalysis(listing)
}

/**
 * Predict demand
 */
export function predictDemand(listing: Partial<Listing>): DemandPrediction {
  logger.debug('AI', 'Predicting demand', { id: listing.id })
  return fakeDemandPrediction(listing)
}

/**
 * Get listing suggestions for user
 */
export function getSuggestions(
  user: User | null,
  allListings: ListingCard[],
  viewedListings: string[] = []
): ListingCard[] {
  logger.debug('AI', 'Getting suggestions', { 
    userId: user?.id, 
    total: allListings.length 
  })

  // Filter out viewed
  const unseen = allListings.filter(l => !viewedListings.includes(l.id))
  
  // Sort by score
  return unseen
    .map(l => ({ listing: l, score: fakeScore(l as unknown as Listing) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(r => r.listing)
}

/**
 * AI Service namespace
 */
export const AIService = {
  generateIntelligence,
  matchListings,
  analyzePrices,
  predictDemand,
  getSuggestions,
}

export default AIService
