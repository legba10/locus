/**
 * LOCUS Context Types
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Unified context for all decision-making.
 */

import type { UserProfile } from '../domain/userProfile.model'
import type { User } from '../domain/user.model'
import type { ProductState } from '../domain/flows/product.flow'
import type { RankingResult } from '../domain/ranking.model'
import type { MarketState } from '../domain/market/market.model'
import type { StrategyConfig } from '../domain/strategy/product.strategy'
import type { RawEventSource } from '../events/event.types'

/**
 * Decision source
 */
export type DecisionSource = RawEventSource

/**
 * Global context for decision-making
 */
export interface GlobalContext {
  // User context
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isOwner: boolean
  
  // Product context
  productState: ProductState
  
  // Ranking context
  ranking: RankingResult | null
  currentListingId: string | null
  
  // Market context
  market: MarketState | null
  
  // Strategy context
  strategy: StrategyConfig | null

  // AI context (read-only signals)
  aiSignals?: Record<string, unknown> | null
  
  // Source context
  source: DecisionSource
  sessionId: string | null
  
  // Time context
  timestamp: number
  timezone: string
  
  // Flags
  flags: ContextFlags
}

/**
 * Context flags
 */
export interface ContextFlags {
  /** Is first visit */
  isFirstVisit: boolean
  
  /** Is returning user */
  isReturning: boolean
  
  /** Is mobile device */
  isMobile: boolean
  
  /** Has active subscription */
  hasSubscription: boolean
  
  /** Is in A/B test */
  abTestGroup: string | null
}

/**
 * Decision input (from external sources)
 */
export interface DecisionInput {
  userId?: string
  source: DecisionSource
  event: string
  payload?: Record<string, unknown>
  sessionId?: string
  timestamp?: number
}

/**
 * Context snapshot (for logging/debugging)
 */
export interface ContextSnapshot {
  id: string
  context: GlobalContext
  createdAt: number
  reason: string
}

/**
 * Context diff
 */
export interface ContextDiff {
  field: string
  oldValue: unknown
  newValue: unknown
}

/**
 * Default context flags
 */
export const DEFAULT_FLAGS: ContextFlags = {
  isFirstVisit: true,
  isReturning: false,
  isMobile: false,
  hasSubscription: false,
  abTestGroup: null,
}
