/**
 * LOCUS Context Builder
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Builds unified context for decision-making.
 */

import { logger } from '../utils/logger'
import type { User } from '../domain/user.model'
import type { UserProfile, createEmptyProfile } from '../domain/userProfile.model'
import type { ProductState } from '../domain/flows/product.flow'
import { resolveProductState } from '../domain/flows/product.flow'
import type { RankingResult } from '../domain/ranking.model'
import type { MarketState } from '../domain/market/market.model'
import type { StrategyConfig } from '../domain/strategy/product.strategy'
import type {
  GlobalContext,
  DecisionInput,
  ContextFlags,
  ContextSnapshot,
  ContextDiff,
  DecisionSource,
} from './context.types'
import { DEFAULT_FLAGS } from './context.types'

/**
 * Context cache
 */
let cachedContext: GlobalContext | null = null
let cacheExpiry = 0
const CACHE_TTL = 5000 // 5 seconds

/**
 * Snapshot history
 */
const snapshots: ContextSnapshot[] = []
const MAX_SNAPSHOTS = 50

// ==========================================
// CONTEXT BUILDING
// ==========================================

/**
 * Build global context from input
 */
export function buildContext(
  input: DecisionInput,
  user?: User | null,
  profile?: UserProfile | null,
  options?: {
    ranking?: RankingResult | null
    market?: MarketState | null
    strategy?: StrategyConfig | null
    currentListingId?: string | null
    aiSignals?: Record<string, unknown> | null
  }
): GlobalContext {
  logger.debug('ContextBuilder', 'Building context', { source: input.source })
  
  // Determine product state
  const productState = resolveProductState(profile || null, user || null)
  
  // Determine flags
  const flags = buildFlags(profile, user)
  
  // Build context
  const context: GlobalContext = {
    // User
    user: user || null,
    profile: profile || null,
    isAuthenticated: !!user,
    isOwner: user?.roles?.includes('landlord') || false,
    
    // Product
    productState,
    
    // Ranking
    ranking: options?.ranking || null,
    currentListingId: options?.currentListingId || null,
    
    // Market
    market: options?.market || null,
    
    // Strategy
    strategy: options?.strategy || null,

    // AI signals (read-only)
    aiSignals: options?.aiSignals || null,
    
    // Source
    source: input.source,
    sessionId: input.sessionId || null,
    
    // Time
    timestamp: input.timestamp || Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Flags
    flags,
  }
  
  // Update cache
  cachedContext = context
  cacheExpiry = Date.now() + CACHE_TTL
  
  return context
}

/**
 * Build flags from profile
 */
function buildFlags(
  profile: UserProfile | null | undefined,
  user: User | null | undefined
): ContextFlags {
  return {
    isFirstVisit: !profile || profile.behavior.sessionCount <= 1,
    isReturning: (profile?.behavior.sessionCount || 0) > 1,
    isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
    hasSubscription: user?.roles?.includes('admin') || false, // Placeholder
    abTestGroup: null,
  }
}

/**
 * Build context for UI
 */
export function buildUIContext(
  user: User | null,
  profile: UserProfile | null,
  currentListingId?: string
): GlobalContext {
  return buildContext(
    { source: 'ui', event: 'context_build' },
    user,
    profile,
    { currentListingId }
  )
}

/**
 * Build context for Telegram
 */
export function buildTelegramContext(
  input: DecisionInput,
  user?: User | null,
  profile?: UserProfile | null
): GlobalContext {
  return buildContext(
    { ...input, source: 'telegram' },
    user,
    profile
  )
}

/**
 * Build context for AI
 */
export function buildAIContext(
  userId: string,
  user?: User | null,
  profile?: UserProfile | null
): GlobalContext {
  return buildContext(
    { source: 'ai', event: 'ai_request', userId },
    user,
    profile
  )
}

// ==========================================
// CONTEXT MANAGEMENT
// ==========================================

/**
 * Get cached context (if valid)
 */
export function getCachedContext(): GlobalContext | null {
  if (cachedContext && Date.now() < cacheExpiry) {
    return cachedContext
  }
  return null
}

/**
 * Invalidate cache
 */
export function invalidateCache(): void {
  cachedContext = null
  cacheExpiry = 0
}

/**
 * Create context snapshot
 */
export function createSnapshot(
  context: GlobalContext,
  reason: string
): ContextSnapshot {
  const snapshot: ContextSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    context: { ...context },
    createdAt: Date.now(),
    reason,
  }
  
  snapshots.push(snapshot)
  if (snapshots.length > MAX_SNAPSHOTS) {
    snapshots.shift()
  }
  
  return snapshot
}

/**
 * Get snapshots
 */
export function getSnapshots(limit?: number): ContextSnapshot[] {
  if (limit) {
    return snapshots.slice(-limit)
  }
  return [...snapshots]
}

/**
 * Compare contexts
 */
export function diffContexts(
  a: GlobalContext,
  b: GlobalContext
): ContextDiff[] {
  const diffs: ContextDiff[] = []
  
  const fields: (keyof GlobalContext)[] = [
    'isAuthenticated',
    'isOwner',
    'productState',
    'currentListingId',
    'source',
  ]
  
  for (const field of fields) {
    if (a[field] !== b[field]) {
      diffs.push({
        field,
        oldValue: a[field],
        newValue: b[field],
      })
    }
  }
  
  return diffs
}

// ==========================================
// CONTEXT QUERIES
// ==========================================

/**
 * Check if context is authenticated
 */
export function isContextAuthenticated(context: GlobalContext): boolean {
  return context.isAuthenticated && context.user !== null
}

/**
 * Check if context has profile data
 */
export function hasProfileData(context: GlobalContext): boolean {
  return context.profile !== null && 
    context.profile.behavior.viewedListings.length > 0
}

/**
 * Check if context is ready for personalization
 */
export function isReadyForPersonalization(context: GlobalContext): boolean {
  return hasProfileData(context) && 
    (context.profile?.intent.confidence || 0) > 0.3
}

/**
 * Get context summary (for logging)
 */
export function getContextSummary(context: GlobalContext): string {
  return [
    `Source: ${context.source}`,
    `Auth: ${context.isAuthenticated}`,
    `State: ${context.productState}`,
    `Profile: ${hasProfileData(context) ? 'yes' : 'no'}`,
    `Listing: ${context.currentListingId || 'none'}`,
  ].join(' | ')
}

// ==========================================
// EXPORTS
// ==========================================

export const ContextBuilder = {
  build: buildContext,
  buildUI: buildUIContext,
  buildTelegram: buildTelegramContext,
  buildAI: buildAIContext,
  getCached: getCachedContext,
  invalidate: invalidateCache,
  snapshot: createSnapshot,
  getSnapshots,
  diff: diffContexts,
  isAuthenticated: isContextAuthenticated,
  hasProfile: hasProfileData,
  isReadyForPersonalization,
  getSummary: getContextSummary,
}

export default ContextBuilder
