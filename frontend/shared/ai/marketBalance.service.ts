/**
 * LOCUS Market Balance Service
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * Supply/Demand balancing engine.
 * This is Avito/Airbnb level market intelligence.
 */

import { logger } from '../utils/logger'
import type { ListingCard, Listing } from '../domain/listing.model'
import type { UserProfile } from '../domain/userProfile.model'
import type { MarketState, MarketHealth } from '../domain/market/market.model'
import { calculateMarketState, calculateMarketHealth } from '@/domain/market/market.service'

/**
 * Market balance status
 */
export type BalanceStatus = 
  | 'severely_undersupplied'  // Critical shortage
  | 'undersupplied'           // Need more listings
  | 'balanced'                // Healthy
  | 'oversupplied'            // Too many listings
  | 'severely_oversupplied'   // Listings sitting idle

/**
 * Balance action type
 */
export type BalanceAction =
  | 'urgent_supply_boost'     // Critical: need listings NOW
  | 'supply_incentive'        // Encourage new listings
  | 'demand_boost'            // Attract more users
  | 'price_optimization'      // Help owners price better
  | 'visibility_adjustment'   // Adjust listing visibility
  | 'none'                    // Market is balanced

/**
 * Market balance evaluation
 */
export interface MarketBalance {
  status: BalanceStatus
  supply: number
  demand: number
  ratio: number
  
  /** Imbalance severity (0-1) */
  imbalanceSeverity: number
  
  /** Direction of imbalance */
  imbalanceDirection: 'supply' | 'demand' | 'none'
  
  /** Recommended actions */
  actions: BalanceAction[]
  
  /** Urgency level */
  urgency: 'low' | 'medium' | 'high' | 'critical'
  
  /** Health impact */
  healthImpact: MarketHealth
  
  /** Timestamp */
  evaluatedAt: string
}

/**
 * Balance thresholds
 */
const THRESHOLDS = {
  severeUndersupply: 0.3,  // < 0.3 listings per user
  undersupply: 0.7,        // < 0.7 listings per user
  balanced: { min: 0.7, max: 2.0 },
  oversupply: 3.0,         // > 3 listings per user
  severeOversupply: 5.0,   // > 5 listings per user
}

// ==========================================
// BALANCE EVALUATION
// ==========================================

/**
 * Evaluate market balance
 */
export function evaluateBalance(
  listings: (ListingCard | Listing)[],
  activeUsers: UserProfile[]
): MarketBalance {
  logger.debug('MarketBalance', 'Evaluating balance', {
    listings: listings.length,
    users: activeUsers.length,
  })

  const supply = listings.length
  const demand = activeUsers.length
  const ratio = demand > 0 ? supply / demand : supply > 0 ? 10 : 1

  // Determine status
  let status: BalanceStatus
  if (ratio < THRESHOLDS.severeUndersupply) {
    status = 'severely_undersupplied'
  } else if (ratio < THRESHOLDS.undersupply) {
    status = 'undersupplied'
  } else if (ratio <= THRESHOLDS.balanced.max) {
    status = 'balanced'
  } else if (ratio <= THRESHOLDS.oversupply) {
    status = 'oversupplied'
  } else {
    status = 'severely_oversupplied'
  }

  // Calculate imbalance
  const optimalRatio = (THRESHOLDS.balanced.min + THRESHOLDS.balanced.max) / 2
  const deviation = Math.abs(ratio - optimalRatio) / optimalRatio
  const imbalanceSeverity = Math.min(1, deviation)
  const imbalanceDirection: MarketBalance['imbalanceDirection'] = 
    ratio < THRESHOLDS.balanced.min ? 'supply' :
    ratio > THRESHOLDS.balanced.max ? 'demand' : 'none'

  // Determine actions
  const actions = determineActions(status, ratio)

  // Determine urgency
  const urgency = determineUrgency(status, imbalanceSeverity)

  // Calculate health impact
  const segment = { id: 'global', name: 'Global', city: '' }
  const state: MarketState = {
    segment,
    supply,
    demand,
    ratio,
    competitionLevel: ratio < 1 ? 'high' : ratio < 2 ? 'medium' : 'low',
    avgPrice: 0,
    medianPrice: 0,
    priceRange: { min: 0, max: 0 },
    liquidityScore: 0,
    avgDaysOnMarket: 0,
    trend: 'stable',
    updatedAt: new Date().toISOString(),
  }
  const healthImpact = calculateMarketHealth(state)

  return {
    status,
    supply,
    demand,
    ratio,
    imbalanceSeverity,
    imbalanceDirection,
    actions,
    urgency,
    healthImpact,
    evaluatedAt: new Date().toISOString(),
  }
}

/**
 * Determine balance actions
 */
function determineActions(
  status: BalanceStatus,
  ratio: number
): BalanceAction[] {
  switch (status) {
    case 'severely_undersupplied':
      return ['urgent_supply_boost', 'supply_incentive']
    
    case 'undersupplied':
      return ['supply_incentive', 'price_optimization']
    
    case 'balanced':
      return ['none']
    
    case 'oversupplied':
      return ['demand_boost', 'visibility_adjustment']
    
    case 'severely_oversupplied':
      return ['demand_boost', 'price_optimization', 'visibility_adjustment']
    
    default:
      return ['none']
  }
}

/**
 * Determine urgency level
 */
function determineUrgency(
  status: BalanceStatus,
  severity: number
): MarketBalance['urgency'] {
  if (status === 'severely_undersupplied' || status === 'severely_oversupplied') {
    return 'critical'
  }
  if (severity > 0.7) return 'high'
  if (severity > 0.4) return 'medium'
  return 'low'
}

// ==========================================
// BALANCE ACTIONS
// ==========================================

/**
 * Get supply boost recommendations
 */
export function getSupplyBoostRecommendations(
  balance: MarketBalance
): string[] {
  const recommendations: string[] = []
  
  if (balance.imbalanceDirection === 'supply') {
    recommendations.push('Запустить кампанию по привлечению арендодателей')
    recommendations.push('Предложить бесплатное размещение новым владельцам')
    recommendations.push('Отправить email неактивным владельцам')
    
    if (balance.urgency === 'critical') {
      recommendations.push('Активировать партнёрскую программу')
      recommendations.push('Запустить рекламу для владельцев недвижимости')
    }
  }
  
  return recommendations
}

/**
 * Get demand boost recommendations
 */
export function getDemandBoostRecommendations(
  balance: MarketBalance
): string[] {
  const recommendations: string[] = []
  
  if (balance.imbalanceDirection === 'demand') {
    recommendations.push('Запустить SEO-оптимизацию')
    recommendations.push('Активировать ретаргетинг для ушедших пользователей')
    recommendations.push('Создать контент для социальных сетей')
    
    if (balance.urgency === 'high' || balance.urgency === 'critical') {
      recommendations.push('Запустить платную рекламу')
      recommendations.push('Предложить скидки на премиум-контакты')
    }
  }
  
  return recommendations
}

// ==========================================
// CITY-LEVEL BALANCE
// ==========================================

/**
 * Evaluate balance by city
 */
export function evaluateBalanceByCity(
  listings: (ListingCard | Listing)[],
  activeUsers: UserProfile[]
): Map<string, MarketBalance> {
  const results = new Map<string, MarketBalance>()
  
  // Group listings by city
  const listingsByCity = new Map<string, (ListingCard | Listing)[]>()
  listings.forEach(l => {
    const city = l.city || 'Unknown'
    if (!listingsByCity.has(city)) {
      listingsByCity.set(city, [])
    }
    listingsByCity.get(city)!.push(l)
  })
  
  // Group users by intent city
  const usersByCity = new Map<string, UserProfile[]>()
  activeUsers.forEach(u => {
    const city = u.intent.city || 'Unknown'
    if (!usersByCity.has(city)) {
      usersByCity.set(city, [])
    }
    usersByCity.get(city)!.push(u)
  })
  
  // Get all cities
  const allCities = new Set([
    ...listingsByCity.keys(),
    ...usersByCity.keys(),
  ])
  
  // Evaluate each city
  for (const city of allCities) {
    const cityListings = listingsByCity.get(city) || []
    const cityUsers = usersByCity.get(city) || []
    const balance = evaluateBalance(cityListings, cityUsers)
    results.set(city, balance)
  }
  
  return results
}

/**
 * Get cities that need attention
 */
export function getCitiesNeedingAttention(
  balanceByCity: Map<string, MarketBalance>
): { city: string; balance: MarketBalance }[] {
  const needsAttention: { city: string; balance: MarketBalance }[] = []
  
  balanceByCity.forEach((balance, city) => {
    if (balance.urgency === 'high' || balance.urgency === 'critical') {
      needsAttention.push({ city, balance })
    }
  })
  
  // Sort by urgency (critical first)
  return needsAttention.sort((a, b) => {
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return urgencyOrder[b.balance.urgency] - urgencyOrder[a.balance.urgency]
  })
}

// ==========================================
// SERVICE NAMESPACE
// ==========================================

export const MarketBalanceService = {
  evaluate: evaluateBalance,
  evaluateByCity: evaluateBalanceByCity,
  getSupplyBoostRecommendations,
  getDemandBoostRecommendations,
  getCitiesNeedingAttention,
}

export default MarketBalanceService
