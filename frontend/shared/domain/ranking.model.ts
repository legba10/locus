/**
 * LOCUS Ranking Domain Model
 * 
 * PATCH 6: Smart Product Engine
 * 
 * ❌ ListingFlow cannot sort data directly
 * ✅ Only through RankingService
 */

/**
 * Ranking factors
 */
export interface RankingFactors {
  /** Base listing quality score (0-100) */
  qualityScore: number
  
  /** Relevance to user intent (0-100) */
  relevanceScore: number
  
  /** Recency boost (0-20) */
  recencyBoost: number
  
  /** Popularity factor (0-20) */
  popularityBoost: number
  
  /** Price match to budget (0-30) */
  priceMatchScore: number
  
  /** Location match (0-30) */
  locationMatchScore: number
  
  /** Engagement signals (0-20) */
  engagementBoost: number
  
  /** Paid boost (for monetization) */
  paidBoost: number
}

/**
 * Ranking reason for transparency
 */
export interface RankingReason {
  factor: keyof RankingFactors
  contribution: number
  label: string
}

/**
 * Single listing rank
 */
export interface ListingRank {
  listingId: string
  
  /** Final score (0-100+) */
  score: number
  
  /** Normalized position (0-1, higher = better) */
  position: number
  
  /** Individual factors */
  factors: RankingFactors
  
  /** Human-readable reasons */
  reasons: RankingReason[]
  
  /** Boost labels for UI */
  boostLabels: string[]
  
  /** Is this a promoted listing */
  isPromoted: boolean
}

/**
 * Ranking configuration
 */
export interface RankingConfig {
  /** Weight for each factor */
  weights: Partial<Record<keyof RankingFactors, number>>
  
  /** Minimum score threshold */
  minScore: number
  
  /** Maximum results */
  maxResults: number
  
  /** Include promoted listings */
  includePromoted: boolean
  
  /** Diversity factor (0-1) - prevents similar listings clustering */
  diversityFactor: number
}

/**
 * Default ranking configuration
 */
export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  weights: {
    qualityScore: 1.0,
    relevanceScore: 1.5,
    recencyBoost: 0.8,
    popularityBoost: 0.5,
    priceMatchScore: 1.2,
    locationMatchScore: 1.3,
    engagementBoost: 0.7,
    paidBoost: 1.0,
  },
  minScore: 0,
  maxResults: 100,
  includePromoted: true,
  diversityFactor: 0.3,
}

/**
 * Ranking result with metadata
 */
export interface RankingResult {
  /** Ranked listings */
  rankings: ListingRank[]
  
  /** Total before filtering */
  totalCount: number
  
  /** Applied config */
  config: RankingConfig
  
  /** Ranking timestamp */
  rankedAt: string
  
  /** Cache key for invalidation */
  cacheKey: string
}

/**
 * Create empty ranking factors
 */
export function createEmptyFactors(): RankingFactors {
  return {
    qualityScore: 0,
    relevanceScore: 0,
    recencyBoost: 0,
    popularityBoost: 0,
    priceMatchScore: 0,
    locationMatchScore: 0,
    engagementBoost: 0,
    paidBoost: 0,
  }
}

/**
 * Calculate total score from factors
 */
export function calculateTotalScore(
  factors: RankingFactors,
  weights: Partial<Record<keyof RankingFactors, number>> = DEFAULT_RANKING_CONFIG.weights
): number {
  let total = 0
  let totalWeight = 0
  
  for (const [key, value] of Object.entries(factors)) {
    const weight = weights[key as keyof RankingFactors] || 1.0
    total += value * weight
    totalWeight += weight
  }
  
  // Normalize to 0-100 range
  return totalWeight > 0 ? Math.min(100, total / totalWeight) : 0
}

/**
 * Get top reasons for ranking
 */
export function getTopReasons(
  factors: RankingFactors,
  limit: number = 3
): RankingReason[] {
  const reasonLabels: Record<keyof RankingFactors, string> = {
    qualityScore: 'Качественное объявление',
    relevanceScore: 'Соответствует запросу',
    recencyBoost: 'Недавно добавлено',
    popularityBoost: 'Популярное',
    priceMatchScore: 'Подходит по бюджету',
    locationMatchScore: 'Удобное расположение',
    engagementBoost: 'Вам может понравиться',
    paidBoost: 'Продвигаемое',
  }
  
  return Object.entries(factors)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, limit)
    .map(([key, value]) => ({
      factor: key as keyof RankingFactors,
      contribution: value,
      label: reasonLabels[key as keyof RankingFactors],
    }))
}

/**
 * Get boost labels for UI badges
 */
export function getBoostLabels(factors: RankingFactors): string[] {
  const labels: string[] = []
  
  if (factors.recencyBoost > 15) labels.push('Новое')
  if (factors.popularityBoost > 15) labels.push('Популярное')
  if (factors.relevanceScore > 80) labels.push('Для вас')
  if (factors.paidBoost > 0) labels.push('Продвигаемое')
  
  return labels
}
