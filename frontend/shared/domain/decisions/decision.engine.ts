/**
 * LOCUS Decision Engine
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * Core decision-making layer.
 * ❌ UI cannot make decisions
 * ✅ Only through DecisionEngine
 */

import { logger } from '../../utils/logger'
import {
  type DecisionType,
  type DecisionContext,
  type DecisionResult,
  type Decision,
  type DecisionRule,
  createDecision,
  sortByPriority,
} from './decision.model'

// ==========================================
// DECISION RULES
// ==========================================

const DECISION_RULES: DecisionRule[] = [
  // ===== AUTH RULES =====
  {
    id: 'force_auth_high_intent',
    name: 'Force auth for high intent users',
    condition: (ctx) => 
      !ctx.isAuthenticated && 
      ctx.productState === 'engaged' &&
      (ctx.profile?.signals.conversionProbability || 0) > 0.5,
    decision: 'force_auth',
    priority: 'high',
    urgency: 'immediate',
    confidence: 0.8,
    reason: 'User has high intent but not authenticated',
  },
  {
    id: 'show_login_exploring',
    name: 'Show login to exploring users',
    condition: (ctx) => 
      !ctx.isAuthenticated && 
      ctx.productState === 'exploring' &&
      (ctx.profile?.behavior.viewedListings.length || 0) >= 5,
    decision: 'show_login',
    priority: 'medium',
    urgency: 'soon',
    confidence: 0.7,
    reason: 'User is exploring, good time to suggest auth',
  },
  {
    id: 'show_signup_anonymous',
    name: 'Show signup to new users',
    condition: (ctx) => 
      !ctx.isAuthenticated && 
      ctx.productState === 'browsing' &&
      (ctx.profile?.behavior.sessionCount || 0) >= 2,
    decision: 'show_signup',
    priority: 'low',
    urgency: 'passive',
    confidence: 0.5,
    reason: 'Returning anonymous user, suggest signup',
  },

  // ===== MONETIZATION RULES =====
  {
    id: 'paywall_aggressive',
    name: 'Show paywall in aggressive mode',
    condition: (ctx) => 
      ctx.monetizationLevel === 'aggressive' &&
      ctx.isAuthenticated &&
      ctx.productState === 'ready_to_contact',
    decision: 'show_paywall',
    priority: 'high',
    urgency: 'immediate',
    confidence: 0.9,
    reason: 'Aggressive monetization + ready to contact',
  },
  {
    id: 'offer_boost_owner',
    name: 'Offer boost to owner with low visibility',
    condition: (ctx) => 
      ctx.isOwner &&
      ctx.competitionLevel === 'high' &&
      ctx.marketPressure !== undefined && ctx.marketPressure > 0.6,
    decision: 'offer_boost',
    priority: 'medium',
    urgency: 'soon',
    confidence: 0.75,
    reason: 'High competition, listing needs boost',
  },
  {
    id: 'offer_premium_engaged',
    name: 'Offer premium to engaged users',
    condition: (ctx) => 
      ctx.monetizationLevel !== 'none' &&
      ctx.isAuthenticated &&
      ctx.profile?.signals.engagementLevel === 'hot',
    decision: 'offer_premium',
    priority: 'medium',
    urgency: 'scheduled',
    confidence: 0.6,
    reason: 'Highly engaged user, good candidate for premium',
  },

  // ===== ENGAGEMENT RULES =====
  {
    id: 'show_cta_engaged',
    name: 'Show CTA to engaged users',
    condition: (ctx) => 
      ctx.productState === 'engaged' || ctx.productState === 'ready_to_contact',
    decision: 'show_cta',
    priority: 'high',
    urgency: 'immediate',
    confidence: 0.85,
    reason: 'User is engaged, show call to action',
  },
  {
    id: 'push_favorites_interested',
    name: 'Push favorites to interested users',
    condition: (ctx) => 
      ctx.productState === 'interested' &&
      (ctx.profile?.behavior.favoriteListings.length || 0) < 3,
    decision: 'push_favorites',
    priority: 'medium',
    urgency: 'soon',
    confidence: 0.7,
    reason: 'User interested but few favorites, encourage saving',
  },
  {
    id: 'show_similar_on_listing',
    name: 'Show similar listings',
    condition: (ctx) => 
      ctx.currentListingId !== undefined &&
      ctx.productState !== 'anonymous',
    decision: 'show_similar',
    priority: 'low',
    urgency: 'passive',
    confidence: 0.6,
    reason: 'Viewing listing, show alternatives',
  },

  // ===== RETENTION RULES =====
  {
    id: 'notification_churn_risk',
    name: 'Send notification to churning user',
    condition: (ctx) => 
      ctx.churnRisk !== undefined && 
      ctx.churnRisk > 0.7 &&
      ctx.isAuthenticated,
    decision: 'send_notification',
    priority: 'high',
    urgency: 'soon',
    confidence: 0.7,
    reason: 'High churn risk, try to retain',
  },
  {
    id: 'offer_discount_churn',
    name: 'Offer discount to churning owner',
    condition: (ctx) => 
      ctx.churnRisk !== undefined && 
      ctx.churnRisk > 0.8 &&
      ctx.isOwner,
    decision: 'offer_discount',
    priority: 'high',
    urgency: 'immediate',
    confidence: 0.8,
    reason: 'Owner about to churn, offer discount',
  },

  // ===== SUPPLY RULES =====
  {
    id: 'encourage_listing_supply',
    name: 'Encourage listing creation',
    condition: (ctx) => 
      ctx.strategyMode === 'liquidity' &&
      ctx.isAuthenticated &&
      !ctx.isOwner &&
      (ctx.profile?.signals.activityScore || 0) > 50,
    decision: 'encourage_listing',
    priority: 'medium',
    urgency: 'scheduled',
    confidence: 0.5,
    reason: 'Need supply, active user could be owner',
  },
  {
    id: 'suggest_price_drop',
    name: 'Suggest price drop to owner',
    condition: (ctx) => 
      ctx.isOwner &&
      ctx.competitionLevel === 'high' &&
      ctx.marketPressure !== undefined && ctx.marketPressure > 0.7,
    decision: 'suggest_price_drop',
    priority: 'medium',
    urgency: 'scheduled',
    confidence: 0.65,
    reason: 'High competition, suggest pricing optimization',
  },

  // ===== FEED CONTROL RULES =====
  {
    id: 'personalize_mature_profile',
    name: 'Personalize feed for mature profile',
    condition: (ctx) => 
      ctx.profile !== null &&
      ctx.profile.intent.confidence > 0.5,
    decision: 'personalize_feed',
    priority: 'medium',
    urgency: 'immediate',
    confidence: 0.8,
    reason: 'Profile has enough data for personalization',
  },
  {
    id: 'diversify_narrow_interest',
    name: 'Diversify feed for narrow interests',
    condition: (ctx) => 
      ctx.profile !== null &&
      Object.keys(ctx.profile.signals.locationAffinity).length <= 1,
    decision: 'diversify_feed',
    priority: 'low',
    urgency: 'passive',
    confidence: 0.6,
    reason: 'User focused on one area, show variety',
  },
]

// ==========================================
// ENGINE FUNCTIONS
// ==========================================

/**
 * Resolve decisions based on context
 */
export function resolveDecisions(context: DecisionContext): DecisionResult {
  const startTime = Date.now()
  const decisions: Decision[] = []

  logger.debug('DecisionEngine', 'Resolving decisions', {
    productState: context.productState,
    isAuth: context.isAuthenticated,
    strategy: context.strategyMode,
  })

  // Evaluate all rules
  for (const rule of DECISION_RULES) {
    try {
      if (rule.condition(context)) {
        const params = rule.params ? rule.params(context) : undefined
        const decision = createDecision(rule.decision, rule, params)
        decisions.push(decision)
        
        logger.debug('DecisionEngine', `Rule matched: ${rule.id}`)
      }
    } catch (error) {
      logger.warn('DecisionEngine', `Rule ${rule.id} failed`, error)
    }
  }

  // Sort by priority
  const sorted = sortByPriority(decisions)
  
  // Get primary decision
  const primaryDecision = sorted.length > 0 ? sorted[0] : null

  const processingTime = Date.now() - startTime

  logger.debug('DecisionEngine', 'Decisions resolved', {
    count: decisions.length,
    primary: primaryDecision?.type,
    processingTime,
  })

  return {
    decisions: sorted,
    primaryDecision,
    context,
    processingTime,
  }
}

/**
 * Get single best decision
 */
export function resolve(context: DecisionContext): Decision | null {
  const result = resolveDecisions(context)
  return result.primaryDecision
}

/**
 * Check if specific decision should be made
 */
export function shouldDecide(
  context: DecisionContext,
  decision: DecisionType
): boolean {
  const result = resolveDecisions(context)
  return result.decisions.some(d => d.type === decision)
}

/**
 * Get decisions of specific type
 */
export function getDecisionsOfType(
  context: DecisionContext,
  types: DecisionType[]
): Decision[] {
  const result = resolveDecisions(context)
  return result.decisions.filter(d => types.includes(d.type))
}

// ==========================================
// FORCE ACTIONS (for supply/demand balance)
// ==========================================

/**
 * Force boost supply (when demand > supply)
 */
export function forceBoostSupply(context: DecisionContext): Decision {
  return createDecision('encourage_listing', {
    decision: 'encourage_listing',
    priority: 'high',
    urgency: 'immediate',
    confidence: 0.9,
    reason: 'Market imbalance: demand > supply',
  })
}

/**
 * Force limit demand (when supply is low)
 */
export function forceLimitDemand(context: DecisionContext): Decision {
  return createDecision('limit_visibility', {
    decision: 'limit_visibility',
    priority: 'high',
    urgency: 'immediate',
    confidence: 0.85,
    reason: 'Market imbalance: supply critically low',
  })
}

/**
 * Force monetization (revenue pressure)
 */
export function forceMonetization(context: DecisionContext): Decision {
  return createDecision('show_paywall', {
    decision: 'show_paywall',
    priority: 'critical',
    urgency: 'immediate',
    confidence: 0.95,
    reason: 'Revenue target requires monetization push',
  })
}

// ==========================================
// DECISION ENGINE NAMESPACE
// ==========================================

export const DecisionEngine = {
  resolve,
  resolveDecisions,
  shouldDecide,
  getDecisionsOfType,
  forceBoostSupply,
  forceLimitDemand,
  forceMonetization,
}

export default DecisionEngine
