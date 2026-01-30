/**
 * LOCUS Market Domain Model
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * ❌ UI cannot know market state
 * ✅ Only through MarketService
 */

/**
 * Competition level
 */
export type CompetitionLevel = 'low' | 'medium' | 'high' | 'extreme'

/**
 * Market trend
 */
export type MarketTrend = 'declining' | 'stable' | 'growing' | 'booming'

/**
 * Market segment
 */
export interface MarketSegment {
  id: string
  name: string
  city: string
  district?: string
  propertyType?: string
  priceRange?: { min: number; max: number }
}

/**
 * Market state for a segment
 */
export interface MarketState {
  segment: MarketSegment
  
  /** Total active listings */
  supply: number
  
  /** Active users looking in this segment */
  demand: number
  
  /** Supply / Demand ratio */
  ratio: number
  
  /** Competition level */
  competitionLevel: CompetitionLevel
  
  /** Average listing price */
  avgPrice: number
  
  /** Median listing price */
  medianPrice: number
  
  /** Price range (10th to 90th percentile) */
  priceRange: { min: number; max: number }
  
  /** Market liquidity (how fast listings rent) */
  liquidityScore: number
  
  /** Average days on market */
  avgDaysOnMarket: number
  
  /** Market trend */
  trend: MarketTrend
  
  /** Last updated */
  updatedAt: string
}

/**
 * Market pressure indicator
 */
export interface MarketPressure {
  /** Overall pressure score (0-1) */
  score: number
  
  /** Pressure direction */
  direction: 'buyers' | 'sellers' | 'balanced'
  
  /** Contributing factors */
  factors: {
    supplyPressure: number
    demandPressure: number
    pricePressure: number
    competitionPressure: number
  }
  
  /** Recommended action */
  recommendedAction: 'increase_price' | 'decrease_price' | 'boost' | 'wait' | 'none'
}

/**
 * Market health
 */
export interface MarketHealth {
  /** Overall health score (0-100) */
  score: number
  
  /** Health status */
  status: 'unhealthy' | 'weak' | 'moderate' | 'healthy' | 'thriving'
  
  /** Individual metrics */
  metrics: {
    supplyHealth: number
    demandHealth: number
    priceHealth: number
    liquidityHealth: number
    growthHealth: number
  }
  
  /** Issues detected */
  issues: string[]
  
  /** Opportunities */
  opportunities: string[]
}

/**
 * City market summary
 */
export interface CityMarketSummary {
  city: string
  totalListings: number
  activeUsers: number
  avgPrice: number
  marketHealth: MarketHealth
  topSegments: MarketSegment[]
  trend: MarketTrend
}

/**
 * Create empty market state
 */
export function createEmptyMarketState(segment: MarketSegment): MarketState {
  return {
    segment,
    supply: 0,
    demand: 0,
    ratio: 1,
    competitionLevel: 'low',
    avgPrice: 0,
    medianPrice: 0,
    priceRange: { min: 0, max: 0 },
    liquidityScore: 0,
    avgDaysOnMarket: 0,
    trend: 'stable',
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Calculate competition level from ratio
 */
export function calculateCompetitionLevel(ratio: number): CompetitionLevel {
  if (ratio < 0.5) return 'extreme' // Very few listings, high competition for supply
  if (ratio < 1) return 'high'
  if (ratio < 2) return 'medium'
  return 'low'
}

/**
 * Calculate market trend
 */
export function calculateTrend(
  currentSupply: number,
  previousSupply: number,
  currentDemand: number,
  previousDemand: number
): MarketTrend {
  const supplyGrowth = previousSupply > 0 
    ? (currentSupply - previousSupply) / previousSupply 
    : 0
  const demandGrowth = previousDemand > 0 
    ? (currentDemand - previousDemand) / previousDemand 
    : 0
  
  const netGrowth = (supplyGrowth + demandGrowth) / 2
  
  if (netGrowth > 0.2) return 'booming'
  if (netGrowth > 0.05) return 'growing'
  if (netGrowth < -0.1) return 'declining'
  return 'stable'
}

/**
 * Calculate market health
 */
export function calculateMarketHealth(state: MarketState): MarketHealth {
  const metrics = {
    supplyHealth: Math.min(100, state.supply * 2), // More supply = healthier (up to a point)
    demandHealth: Math.min(100, state.demand * 3),
    priceHealth: state.avgPrice > 0 ? 70 : 0, // Has price data
    liquidityHealth: state.liquidityScore * 100,
    growthHealth: state.trend === 'booming' ? 100 : 
                  state.trend === 'growing' ? 80 : 
                  state.trend === 'stable' ? 60 : 30,
  }
  
  const score = Math.round(
    (metrics.supplyHealth + metrics.demandHealth + metrics.priceHealth + 
     metrics.liquidityHealth + metrics.growthHealth) / 5
  )
  
  const status: MarketHealth['status'] = 
    score >= 80 ? 'thriving' :
    score >= 60 ? 'healthy' :
    score >= 40 ? 'moderate' :
    score >= 20 ? 'weak' : 'unhealthy'
  
  const issues: string[] = []
  const opportunities: string[] = []
  
  if (state.ratio < 1) {
    issues.push('Недостаток предложения')
    opportunities.push('Привлечение арендодателей')
  }
  if (state.ratio > 3) {
    issues.push('Избыток предложения')
    opportunities.push('Привлечение арендаторов')
  }
  if (state.avgDaysOnMarket > 30) {
    issues.push('Низкая ликвидность')
    opportunities.push('Оптимизация цен')
  }
  
  return { score, status, metrics, issues, opportunities }
}

/**
 * Calculate market pressure
 */
export function calculateMarketPressure(state: MarketState): MarketPressure {
  const supplyPressure = state.supply > 0 ? Math.min(1, 50 / state.supply) : 1
  const demandPressure = state.demand > 0 ? Math.min(1, state.demand / 50) : 0
  const pricePressure = state.avgPrice > 50000 ? 0.5 : 0.3
  const competitionPressure = 
    state.competitionLevel === 'extreme' ? 1 :
    state.competitionLevel === 'high' ? 0.7 :
    state.competitionLevel === 'medium' ? 0.4 : 0.2
  
  const score = (supplyPressure + demandPressure + pricePressure + competitionPressure) / 4
  
  const direction: MarketPressure['direction'] = 
    state.ratio < 1 ? 'buyers' :
    state.ratio > 2 ? 'sellers' : 'balanced'
  
  const recommendedAction: MarketPressure['recommendedAction'] = 
    direction === 'buyers' && competitionPressure > 0.6 ? 'boost' :
    direction === 'sellers' ? 'decrease_price' :
    score > 0.7 ? 'boost' : 'none'
  
  return {
    score,
    direction,
    factors: {
      supplyPressure,
      demandPressure,
      pricePressure,
      competitionPressure,
    },
    recommendedAction,
  }
}
