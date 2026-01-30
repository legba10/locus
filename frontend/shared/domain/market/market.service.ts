/**
 * LOCUS Market Service
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * ❌ UI cannot know market state
 * ✅ Only through MarketService
 */

import { logger } from '../../utils/logger'
import type { ListingCard, Listing } from '../listing.model'
import type { UserProfile } from '../userProfile.model'
import {
  type MarketSegment,
  type MarketState,
  type MarketPressure,
  type MarketHealth,
  type CityMarketSummary,
  type CompetitionLevel,
  createEmptyMarketState,
  calculateCompetitionLevel,
  calculateTrend,
  calculateMarketHealth,
  calculateMarketPressure,
} from './market.model'

// ==========================================
// STATE CALCULATION
// ==========================================

/**
 * Calculate market state for a segment
 */
export function calculateMarketState(
  segment: MarketSegment,
  listings: (ListingCard | Listing)[],
  activeUsers: UserProfile[]
): MarketState {
  logger.debug('MarketService', 'Calculating market state', { segment: segment.name })

  // Filter listings for this segment
  const segmentListings = listings.filter(l => {
    if (segment.city && l.city !== segment.city) return false
    if ('district' in l && segment.district && l.district !== segment.district) return false
    if (segment.priceRange) {
      if (l.price < segment.priceRange.min || l.price > segment.priceRange.max) return false
    }
    return true
  })

  // Filter users interested in this segment
  const interestedUsers = activeUsers.filter(u => {
    if (segment.city && u.intent.city && u.intent.city !== segment.city) return false
    if (segment.priceRange && u.intent.budgetMax) {
      if (u.intent.budgetMax < segment.priceRange.min) return false
    }
    return true
  })

  const supply = segmentListings.length
  const demand = interestedUsers.length
  const ratio = demand > 0 ? supply / demand : supply > 0 ? 10 : 1

  // Calculate prices
  const prices = segmentListings.map(l => l.price).filter(p => p > 0).sort((a, b) => a - b)
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) 
    : 0
  const medianPrice = prices.length > 0 
    ? prices[Math.floor(prices.length / 2)] 
    : 0
  const priceRange = {
    min: prices.length > 0 ? prices[Math.floor(prices.length * 0.1)] : 0,
    max: prices.length > 0 ? prices[Math.floor(prices.length * 0.9)] : 0,
  }

  // Calculate liquidity (using views as proxy)
  const totalViews = segmentListings.reduce((sum, l) => sum + (l.views || 0), 0)
  const avgViews = supply > 0 ? totalViews / supply : 0
  const liquidityScore = Math.min(1, avgViews / 100) // Normalize to 0-1

  // Estimate days on market (would need real data)
  const avgDaysOnMarket = liquidityScore > 0.7 ? 7 : liquidityScore > 0.4 ? 14 : 30

  return {
    segment,
    supply,
    demand,
    ratio,
    competitionLevel: calculateCompetitionLevel(ratio),
    avgPrice,
    medianPrice,
    priceRange,
    liquidityScore,
    avgDaysOnMarket,
    trend: 'stable', // Would need historical data
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Calculate market state for a city
 */
export function calculateCityMarket(
  city: string,
  listings: (ListingCard | Listing)[],
  activeUsers: UserProfile[]
): CityMarketSummary {
  const segment: MarketSegment = {
    id: `city_${city}`,
    name: city,
    city,
  }

  const state = calculateMarketState(segment, listings, activeUsers)
  const health = calculateMarketHealth(state)

  // Find top segments (by district)
  const districtCounts = new Map<string, number>()
  listings.filter(l => l.city === city).forEach(l => {
    if ('district' in l && l.district) {
      districtCounts.set(l.district, (districtCounts.get(l.district) || 0) + 1)
    }
  })

  const topSegments: MarketSegment[] = Array.from(districtCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([district]) => ({
      id: `${city}_${district}`,
      name: `${city} - ${district}`,
      city,
      district,
    }))

  return {
    city,
    totalListings: state.supply,
    activeUsers: state.demand,
    avgPrice: state.avgPrice,
    marketHealth: health,
    topSegments,
    trend: state.trend,
  }
}

// ==========================================
// MARKET ANALYSIS
// ==========================================

/**
 * Get market pressure for a listing
 */
export function getListingMarketPressure(
  listing: ListingCard | Listing,
  allListings: (ListingCard | Listing)[],
  activeUsers: UserProfile[]
): MarketPressure {
  const segment: MarketSegment = {
    id: `listing_${listing.id}`,
    name: listing.city,
    city: listing.city,
    district: 'district' in listing ? listing.district : undefined,
    priceRange: {
      min: listing.price * 0.8,
      max: listing.price * 1.2,
    },
  }

  const state = calculateMarketState(segment, allListings, activeUsers)
  return calculateMarketPressure(state)
}

/**
 * Get competition level for a listing
 */
export function getListingCompetition(
  listing: ListingCard | Listing,
  allListings: (ListingCard | Listing)[]
): CompetitionLevel {
  // Count similar listings
  const similar = allListings.filter(l => {
    if (l.id === listing.id) return false
    if (l.city !== listing.city) return false
    if (Math.abs(l.price - listing.price) > listing.price * 0.2) return false
    return true
  })

  if (similar.length > 50) return 'extreme'
  if (similar.length > 20) return 'high'
  if (similar.length > 5) return 'medium'
  return 'low'
}

/**
 * Get price recommendation
 */
export function getPriceRecommendation(
  listing: ListingCard | Listing,
  marketState: MarketState
): {
  recommendedPrice: number
  adjustment: number
  reason: string
} {
  const currentPrice = listing.price
  const marketMedian = marketState.medianPrice

  if (marketMedian === 0) {
    return {
      recommendedPrice: currentPrice,
      adjustment: 0,
      reason: 'Недостаточно данных о рынке',
    }
  }

  const diff = (currentPrice - marketMedian) / marketMedian
  
  if (diff > 0.2) {
    // Price is 20%+ above market
    const recommended = Math.round(marketMedian * 1.1)
    return {
      recommendedPrice: recommended,
      adjustment: recommended - currentPrice,
      reason: 'Цена выше рыночной на ' + Math.round(diff * 100) + '%',
    }
  }

  if (diff < -0.2 && marketState.competitionLevel !== 'extreme') {
    // Price is 20%+ below market (underpriced)
    const recommended = Math.round(marketMedian * 0.95)
    return {
      recommendedPrice: recommended,
      adjustment: recommended - currentPrice,
      reason: 'Есть потенциал для повышения цены',
    }
  }

  return {
    recommendedPrice: currentPrice,
    adjustment: 0,
    reason: 'Цена соответствует рынку',
  }
}

// ==========================================
// MARKET INSIGHTS
// ==========================================

/**
 * Get market insights for dashboard
 */
export function getMarketInsights(
  listings: (ListingCard | Listing)[],
  activeUsers: UserProfile[]
): {
  totalSupply: number
  totalDemand: number
  overallHealth: MarketHealth
  hotCities: string[]
  coldCities: string[]
  priceInsight: string
} {
  // Group by city
  const cityCounts = new Map<string, number>()
  listings.forEach(l => {
    cityCounts.set(l.city, (cityCounts.get(l.city) || 0) + 1)
  })

  const totalSupply = listings.length
  const totalDemand = activeUsers.length

  // Calculate overall health
  const globalSegment: MarketSegment = { id: 'global', name: 'Global', city: '' }
  const globalState: MarketState = {
    ...createEmptyMarketState(globalSegment),
    supply: totalSupply,
    demand: totalDemand,
    ratio: totalDemand > 0 ? totalSupply / totalDemand : 1,
  }
  const overallHealth = calculateMarketHealth(globalState)

  // Find hot and cold cities
  const cityEntries = Array.from(cityCounts.entries()).sort((a, b) => b[1] - a[1])
  const hotCities = cityEntries.slice(0, 3).map(([city]) => city)
  const coldCities = cityEntries.slice(-3).map(([city]) => city)

  // Price insight
  const avgPrice = listings.length > 0
    ? Math.round(listings.reduce((sum, l) => sum + l.price, 0) / listings.length)
    : 0
  const priceInsight = avgPrice > 50000 
    ? 'Средняя цена выше 50 000 ₽'
    : avgPrice > 30000
    ? 'Средняя цена 30-50 000 ₽'
    : 'Рынок доступного жилья'

  return {
    totalSupply,
    totalDemand,
    overallHealth,
    hotCities,
    coldCities,
    priceInsight,
  }
}

// ==========================================
// MARKET SERVICE NAMESPACE
// ==========================================

export const MarketService = {
  calculateMarketState,
  calculateCityMarket,
  getListingMarketPressure,
  getListingCompetition,
  getPriceRecommendation,
  getMarketInsights,
}

export { calculateMarketHealth } from './market.model'

export default MarketService
