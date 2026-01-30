/**
 * LOCUS Product Strategy Layer
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * Top-level strategy that controls platform behavior.
 * ❌ UI cannot know strategy
 * ✅ Only through ProductStrategy
 */

import { logger } from '../../utils/logger'
import type { MarketBalance } from '../../ai/marketBalance.service'
import type { PlatformGrowthState } from '../../ai/growth.service'
import type { MonetizationLevel } from '../decisions/decision.model'

/**
 * Strategy modes
 */
export type StrategyMode =
  | 'growth'          // Focus on user acquisition
  | 'monetization'    // Focus on revenue
  | 'liquidity'       // Focus on supply/demand balance
  | 'market_capture'  // Aggressive expansion
  | 'retention'       // Focus on keeping users
  | 'balanced'        // Default balanced approach

/**
 * Strategy priority
 */
export type StrategyPriority =
  | 'users'           // Prioritize user growth
  | 'revenue'         // Prioritize revenue
  | 'supply'          // Prioritize listing supply
  | 'quality'         // Prioritize content quality
  | 'engagement'      // Prioritize user engagement

/**
 * Strategy configuration
 */
export interface StrategyConfig {
  mode: StrategyMode
  priority: StrategyPriority
  
  /** Monetization aggressiveness */
  monetizationLevel: MonetizationLevel
  
  /** User acquisition intensity (0-1) */
  acquisitionIntensity: number
  
  /** Retention focus (0-1) */
  retentionFocus: number
  
  /** Supply incentive level (0-1) */
  supplyIncentive: number
  
  /** Quality threshold for listings */
  qualityThreshold: number
}

/**
 * Strategy input data
 */
export interface StrategyInput {
  marketBalance?: MarketBalance
  growthState?: PlatformGrowthState
  revenueTarget?: number
  currentRevenue?: number
  userTarget?: number
  currentUsers?: number
}

/**
 * Strategy output
 */
export interface StrategyOutput {
  config: StrategyConfig
  reasoning: string[]
  kpis: StrategyKPI[]
  alerts: StrategyAlert[]
}

/**
 * Strategy KPI
 */
export interface StrategyKPI {
  name: string
  current: number
  target: number
  status: 'on_track' | 'at_risk' | 'off_track'
}

/**
 * Strategy alert
 */
export interface StrategyAlert {
  level: 'info' | 'warning' | 'critical'
  message: string
  action?: string
}

/**
 * Default strategy configurations
 */
const STRATEGY_CONFIGS: Record<StrategyMode, Omit<StrategyConfig, 'mode'>> = {
  growth: {
    priority: 'users',
    monetizationLevel: 'soft',
    acquisitionIntensity: 0.9,
    retentionFocus: 0.6,
    supplyIncentive: 0.7,
    qualityThreshold: 0.4,
  },
  monetization: {
    priority: 'revenue',
    monetizationLevel: 'aggressive',
    acquisitionIntensity: 0.5,
    retentionFocus: 0.8,
    supplyIncentive: 0.4,
    qualityThreshold: 0.6,
  },
  liquidity: {
    priority: 'supply',
    monetizationLevel: 'moderate',
    acquisitionIntensity: 0.7,
    retentionFocus: 0.7,
    supplyIncentive: 0.9,
    qualityThreshold: 0.5,
  },
  market_capture: {
    priority: 'users',
    monetizationLevel: 'none',
    acquisitionIntensity: 1.0,
    retentionFocus: 0.4,
    supplyIncentive: 0.8,
    qualityThreshold: 0.3,
  },
  retention: {
    priority: 'engagement',
    monetizationLevel: 'soft',
    acquisitionIntensity: 0.4,
    retentionFocus: 1.0,
    supplyIncentive: 0.5,
    qualityThreshold: 0.7,
  },
  balanced: {
    priority: 'engagement',
    monetizationLevel: 'moderate',
    acquisitionIntensity: 0.6,
    retentionFocus: 0.7,
    supplyIncentive: 0.6,
    qualityThreshold: 0.5,
  },
}

// ==========================================
// STRATEGY RESOLUTION
// ==========================================

/**
 * Resolve strategy based on current state
 */
export function resolveStrategy(input: StrategyInput): StrategyOutput {
  logger.debug('ProductStrategy', 'Resolving strategy', input)
  
  const reasoning: string[] = []
  const alerts: StrategyAlert[] = []
  let mode: StrategyMode = 'balanced'
  
  // Check market balance
  if (input.marketBalance) {
    if (input.marketBalance.status === 'severely_undersupplied') {
      mode = 'liquidity'
      reasoning.push('Критическая нехватка предложения, фокус на привлечение владельцев')
      alerts.push({
        level: 'critical',
        message: 'Supply crisis: need immediate action',
        action: 'Launch owner acquisition campaign',
      })
    } else if (input.marketBalance.status === 'severely_oversupplied') {
      mode = 'growth'
      reasoning.push('Избыток предложения, нужны пользователи')
    }
  }
  
  // Check growth state
  if (input.growthState) {
    if (input.growthState.trend === 'declining') {
      if (mode === 'balanced') mode = 'retention'
      reasoning.push('Негативный тренд роста, фокус на удержание')
      alerts.push({
        level: 'warning',
        message: 'Growth declining, retention focus needed',
      })
    }
    
    if (input.growthState.healthScore < 30) {
      alerts.push({
        level: 'critical',
        message: 'Platform health critical',
        action: 'Emergency growth measures',
      })
    }
  }
  
  // Check revenue targets
  if (input.revenueTarget && input.currentRevenue !== undefined) {
    const revenueProgress = input.currentRevenue / input.revenueTarget
    if (revenueProgress < 0.5 && mode === 'balanced') {
      mode = 'monetization'
      reasoning.push('Отставание от плана выручки, усиление монетизации')
    }
  }
  
  // Check user targets
  if (input.userTarget && input.currentUsers !== undefined) {
    const userProgress = input.currentUsers / input.userTarget
    if (userProgress < 0.6 && mode === 'balanced') {
      mode = 'growth'
      reasoning.push('Отставание от плана по пользователям, фокус на рост')
    }
  }
  
  // Get config for mode
  const baseConfig = STRATEGY_CONFIGS[mode]
  const config: StrategyConfig = { mode, ...baseConfig }
  
  // Build KPIs
  const kpis: StrategyKPI[] = []
  
  if (input.userTarget && input.currentUsers !== undefined) {
    const progress = input.currentUsers / input.userTarget
    kpis.push({
      name: 'Пользователи',
      current: input.currentUsers,
      target: input.userTarget,
      status: progress >= 0.9 ? 'on_track' : progress >= 0.7 ? 'at_risk' : 'off_track',
    })
  }
  
  if (input.revenueTarget && input.currentRevenue !== undefined) {
    const progress = input.currentRevenue / input.revenueTarget
    kpis.push({
      name: 'Выручка',
      current: input.currentRevenue,
      target: input.revenueTarget,
      status: progress >= 0.9 ? 'on_track' : progress >= 0.7 ? 'at_risk' : 'off_track',
    })
  }
  
  if (input.growthState) {
    kpis.push({
      name: 'Здоровье платформы',
      current: input.growthState.healthScore,
      target: 70,
      status: input.growthState.healthScore >= 70 ? 'on_track' : 
              input.growthState.healthScore >= 50 ? 'at_risk' : 'off_track',
    })
  }
  
  if (reasoning.length === 0) {
    reasoning.push('Сбалансированная стратегия для текущих условий')
  }
  
  return { config, reasoning, kpis, alerts }
}

/**
 * Get strategy for specific mode
 */
export function getStrategyConfig(mode: StrategyMode): StrategyConfig {
  return { mode, ...STRATEGY_CONFIGS[mode] }
}

/**
 * Check if should prioritize monetization
 */
export function shouldPrioritizeMonetization(config: StrategyConfig): boolean {
  return config.mode === 'monetization' || 
         config.monetizationLevel === 'aggressive'
}

/**
 * Check if should prioritize growth
 */
export function shouldPrioritizeGrowth(config: StrategyConfig): boolean {
  return config.mode === 'growth' || 
         config.mode === 'market_capture' ||
         config.acquisitionIntensity > 0.7
}

/**
 * Check if should prioritize supply
 */
export function shouldPrioritizeSupply(config: StrategyConfig): boolean {
  return config.mode === 'liquidity' ||
         config.supplyIncentive > 0.7
}

/**
 * Get monetization level for context
 */
export function getMonetizationLevel(config: StrategyConfig): MonetizationLevel {
  return config.monetizationLevel
}

// ==========================================
// PRODUCT STRATEGY NAMESPACE
// ==========================================

export const ProductStrategy = {
  resolve: resolveStrategy,
  getConfig: getStrategyConfig,
  shouldPrioritizeMonetization,
  shouldPrioritizeGrowth,
  shouldPrioritizeSupply,
  getMonetizationLevel,
}

export default ProductStrategy
