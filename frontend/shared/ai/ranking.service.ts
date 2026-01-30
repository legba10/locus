/**
 * LOCUS Ranking Service
 * 
 * PATCH 6: Smart Product Engine
 * 
 * Ranks listings based on user profile.
 * ❌ ListingFlow cannot sort data directly
 * ✅ Only through this service
 */

import { logger } from '../utils/logger'
import type { ListingCard, Listing } from '../domain/listing.model'
import type { UserProfile } from '../domain/userProfile.model'
import {
  type ListingRank,
  type RankingFactors,
  type RankingConfig,
  type RankingResult,
  DEFAULT_RANKING_CONFIG,
  createEmptyFactors,
  calculateTotalScore,
  getTopReasons,
  getBoostLabels,
} from '../domain/ranking.model'

// ==========================================
// FACTOR CALCULATORS (deterministic, no random)
// ==========================================

/**
 * Calculate quality score based on listing completeness
 */
function calculateQualityScore(listing: ListingCard | Listing): number {
  let score = 0
  
  // Has title (required)
  if (listing.title && listing.title.length > 5) score += 20
  if (listing.title && listing.title.length > 20) score += 10
  
  // Has price
  if (listing.price && listing.price > 0) score += 15
  
  // Has location
  if (listing.city) score += 10
  if ('district' in listing && listing.district) score += 10
  
  // Has details
  if (listing.rooms && listing.rooms > 0) score += 10
  if (listing.area && listing.area > 0) score += 10
  
  // Has cover photo
  if ('coverPhoto' in listing && listing.coverPhoto) score += 15
  if ('media' in listing && (listing as Listing).media?.length > 0) score += 15
  
  return Math.min(100, score)
}

/**
 * Calculate relevance to user intent
 */
function calculateRelevanceScore(
  listing: ListingCard | Listing,
  profile: UserProfile | null
): number {
  if (!profile || profile.intent.confidence < 0.1) {
    return 50 // Neutral relevance if no profile
  }

  let score = 0
  let factors = 0

  // City match
  if (profile.intent.city) {
    factors++
    if (listing.city === profile.intent.city) {
      score += 100
    } else if (profile.signals.locationAffinity[listing.city]) {
      score += profile.signals.locationAffinity[listing.city] * 70
    }
  }

  // Budget match
  if (profile.intent.budgetMin !== undefined && profile.intent.budgetMax !== undefined) {
    factors++
    const price = listing.price
    if (price >= profile.intent.budgetMin && price <= profile.intent.budgetMax) {
      score += 100
    } else if (price < profile.intent.budgetMin) {
      // Under budget - still good
      score += 70
    } else {
      // Over budget - penalty based on how much
      const overBy = (price - profile.intent.budgetMax) / profile.intent.budgetMax
      score += Math.max(0, 100 - overBy * 200)
    }
  }

  // Rooms match
  if (profile.intent.rooms && profile.intent.rooms.length > 0 && listing.rooms) {
    factors++
    if (profile.intent.rooms.includes(listing.rooms)) {
      score += 100
    } else {
      // Close match
      const minDiff = Math.min(...profile.intent.rooms.map(r => Math.abs(r - (listing.rooms || 0))))
      score += Math.max(0, 100 - minDiff * 30)
    }
  }

  // Viewed similar
  if (profile.behavior.viewedListings.includes(listing.id)) {
    // Already viewed - slight penalty to show variety
    score -= 10
  }

  // Favorited - boost similar listings
  if (profile.behavior.favoriteListings.includes(listing.id)) {
    score += 20 // Already favorite
  }

  return factors > 0 ? Math.min(100, score / factors) : 50
}

/**
 * Calculate recency boost
 */
function calculateRecencyBoost(listing: ListingCard | Listing): number {
  // Use views as proxy for age if no createdAt available
  const views = listing.views || 0
  
  if ('createdAt' in listing && listing.createdAt) {
    const ageMs = Date.now() - new Date(listing.createdAt).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    
    if (ageDays < 1) return 20
    if (ageDays < 3) return 15
    if (ageDays < 7) return 10
    if (ageDays < 14) return 5
    return 0
  }
  
  // Fallback: low views = probably new
  if (views < 10) return 15
  if (views < 50) return 10
  if (views < 100) return 5
  return 0
}

/**
 * Calculate popularity boost
 */
function calculatePopularityBoost(listing: ListingCard | Listing): number {
  const views = listing.views || 0
  
  if (views > 500) return 20
  if (views > 200) return 15
  if (views > 100) return 10
  if (views > 50) return 5
  return 0
}

/**
 * Calculate price match score
 */
function calculatePriceMatchScore(
  listing: ListingCard | Listing,
  profile: UserProfile | null
): number {
  if (!profile || profile.intent.budgetMax === undefined) {
    return 15 // Neutral
  }

  const price = listing.price
  const { budgetMin = 0, budgetMax } = profile.intent

  if (price >= budgetMin && price <= budgetMax) {
    // Perfect match - bonus for being in the sweet spot
    const midpoint = (budgetMin + budgetMax) / 2
    const deviation = Math.abs(price - midpoint) / (budgetMax - budgetMin || 1)
    return 30 - deviation * 10
  }

  if (price < budgetMin) {
    // Under budget - good
    return 20
  }

  // Over budget - penalty
  const overBy = (price - budgetMax) / budgetMax
  return Math.max(0, 15 - overBy * 30)
}

/**
 * Calculate location match score
 */
function calculateLocationMatchScore(
  listing: ListingCard | Listing,
  profile: UserProfile | null
): number {
  if (!profile) return 15

  let score = 0

  // City match
  if (profile.intent.city && listing.city === profile.intent.city) {
    score += 20
  }

  // Location affinity
  if (listing.city && profile.signals.locationAffinity[listing.city]) {
    score += profile.signals.locationAffinity[listing.city] * 10
  }

  if ('district' in listing && listing.district) {
    const key = `${listing.city}:${listing.district}`
    if (profile.signals.locationAffinity[key]) {
      score += profile.signals.locationAffinity[key] * 15
    }
  }

  return Math.min(30, score)
}

/**
 * Calculate engagement boost
 */
function calculateEngagementBoost(
  listing: ListingCard | Listing,
  profile: UserProfile | null
): number {
  if (!profile) return 0

  let score = 0

  // Viewed before
  if (profile.behavior.viewedListings.includes(listing.id)) {
    score += 5 // Some interest shown
  }

  // Favorited
  if (profile.behavior.favoriteListings.includes(listing.id)) {
    score += 15
  }

  // Contacted
  if (profile.behavior.contactedListings.includes(listing.id)) {
    score += 10
  }

  return Math.min(20, score)
}

// ==========================================
// MAIN RANKING FUNCTION
// ==========================================

/**
 * Calculate all factors for a listing
 */
function calculateFactors(
  listing: ListingCard | Listing,
  profile: UserProfile | null
): RankingFactors {
  return {
    qualityScore: calculateQualityScore(listing),
    relevanceScore: calculateRelevanceScore(listing, profile),
    recencyBoost: calculateRecencyBoost(listing),
    popularityBoost: calculatePopularityBoost(listing),
    priceMatchScore: calculatePriceMatchScore(listing, profile),
    locationMatchScore: calculateLocationMatchScore(listing, profile),
    engagementBoost: calculateEngagementBoost(listing, profile),
    paidBoost: 0, // Set by monetization system
  }
}

/**
 * Rank a single listing
 */
function rankListing(
  listing: ListingCard | Listing,
  profile: UserProfile | null,
  config: RankingConfig
): ListingRank {
  const factors = calculateFactors(listing, profile)
  const score = calculateTotalScore(factors, config.weights)
  const reasons = getTopReasons(factors)
  const boostLabels = getBoostLabels(factors)

  return {
    listingId: listing.id,
    score,
    position: 0, // Set after sorting
    factors,
    reasons,
    boostLabels,
    isPromoted: factors.paidBoost > 0,
  }
}

/**
 * Rank multiple listings
 */
export function rankListings(
  listings: (ListingCard | Listing)[],
  profile: UserProfile | null,
  config: Partial<RankingConfig> = {}
): RankingResult {
  const fullConfig = { ...DEFAULT_RANKING_CONFIG, ...config }
  
  logger.debug('Ranking', 'Ranking listings', { 
    count: listings.length, 
    hasProfile: !!profile 
  })

  // Calculate ranks
  let rankings = listings.map(listing => 
    rankListing(listing, profile, fullConfig)
  )

  // Sort by score (descending)
  rankings.sort((a, b) => b.score - a.score)

  // Apply diversity if configured
  if (fullConfig.diversityFactor > 0) {
    rankings = applyDiversity(rankings, listings, fullConfig.diversityFactor)
  }

  // Set positions and filter
  rankings = rankings
    .filter(r => r.score >= fullConfig.minScore)
    .slice(0, fullConfig.maxResults)
    .map((r, i) => ({
      ...r,
      position: i / (rankings.length || 1),
    }))

  // Generate cache key
  const cacheKey = generateCacheKey(listings, profile)

  return {
    rankings,
    totalCount: listings.length,
    config: fullConfig,
    rankedAt: new Date().toISOString(),
    cacheKey,
  }
}

/**
 * Apply diversity to prevent clustering of similar listings
 */
function applyDiversity(
  rankings: ListingRank[],
  listings: (ListingCard | Listing)[],
  factor: number
): ListingRank[] {
  if (factor === 0 || rankings.length <= 1) return rankings

  const listingMap = new Map(listings.map(l => [l.id, l]))
  const result: ListingRank[] = []
  const usedCities: string[] = []
  const usedPriceRanges: number[] = []

  for (const rank of rankings) {
    const listing = listingMap.get(rank.listingId)
    if (!listing) {
      result.push(rank)
      continue
    }

    // Check diversity penalty
    let penalty = 0

    // City diversity
    if (usedCities.slice(-3).filter(c => c === listing.city).length >= 2) {
      penalty += 10 * factor
    }
    usedCities.push(listing.city)

    // Price range diversity (within 10%)
    const priceRange = Math.floor(listing.price / (listing.price * 0.1 || 1))
    if (usedPriceRanges.slice(-3).filter(r => r === priceRange).length >= 2) {
      penalty += 5 * factor
    }
    usedPriceRanges.push(priceRange)

    result.push({
      ...rank,
      score: rank.score - penalty,
    })
  }

  // Re-sort after diversity penalty
  return result.sort((a, b) => b.score - a.score)
}

/**
 * Generate deterministic cache key
 */
function generateCacheKey(
  listings: (ListingCard | Listing)[],
  profile: UserProfile | null
): string {
  const listingIds = listings.map(l => l.id).sort().join(',')
  const profileKey = profile 
    ? `${profile.userId}-${profile.behavior.viewedListings.length}-${profile.intent.confidence}`
    : 'anonymous'
  
  return `${profileKey}:${listingIds.slice(0, 100)}`
}

// ==========================================
// CONVENIENCE FUNCTIONS
// ==========================================

/**
 * Get top N listings
 */
export function getTopListings(
  listings: (ListingCard | Listing)[],
  profile: UserProfile | null,
  limit: number = 10
): ListingRank[] {
  const result = rankListings(listings, profile, { maxResults: limit })
  return result.rankings
}

/**
 * Get listing score only
 */
export function getListingScore(
  listing: ListingCard | Listing,
  profile: UserProfile | null
): number {
  const factors = calculateFactors(listing, profile)
  return calculateTotalScore(factors)
}

/**
 * Compare two listings
 */
export function compareListings(
  a: ListingCard | Listing,
  b: ListingCard | Listing,
  profile: UserProfile | null
): number {
  return getListingScore(b, profile) - getListingScore(a, profile)
}

/**
 * Fallback ranking (no AI, just quality)
 */
export function fallbackRanking(listings: (ListingCard | Listing)[]): ListingRank[] {
  return listings.map(listing => {
    const factors = createEmptyFactors()
    factors.qualityScore = calculateQualityScore(listing)
    factors.recencyBoost = calculateRecencyBoost(listing)
    factors.popularityBoost = calculatePopularityBoost(listing)
    
    const score = calculateTotalScore(factors)
    
    return {
      listingId: listing.id,
      score,
      position: 0,
      factors,
      reasons: getTopReasons(factors),
      boostLabels: getBoostLabels(factors),
      isPromoted: false,
    }
  }).sort((a, b) => b.score - a.score)
}

/**
 * Ranking Service namespace
 */
export const RankingService = {
  rankListings,
  getTopListings,
  getListingScore,
  compareListings,
  fallbackRanking,
}

export default RankingService
