/**
 * LOCUS Execution Pipeline
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Pipeline steps:
 * normalizeEvent → buildContext → calculateMarket → rankListings
 * → resolveStrategy → resolveDecision → applyPolicies → produceActions
 */

import { normalizeEvent } from '../events/event.normalizer'
import type { RawEvent } from '../events/event.types'
import { buildContext } from '../context/context.builder'
import type { GlobalContext, DecisionInput } from '../context/context.types'
import type { ListingCard, Listing } from '../domain/listing.model'
import type { User } from '../domain/user.model'
import type { UserProfile } from '../domain/userProfile.model'
import type { MarketSegment, MarketState } from '../domain/market/market.model'
import { calculateMarketPressure } from '../domain/market/market.model'
import { MarketService } from '../domain/market/market.service'
import type { RankingResult } from '../domain/ranking.model'
import { RankingService } from '../ai/ranking.service'
import type { StrategyInput, StrategyOutput } from '../domain/strategy/product.strategy'
import { ProductStrategy } from '../domain/strategy/product.strategy'
import type { DecisionContext, DecisionResult } from '../domain/decisions/decision.model'
import { createDecisionContext } from '../domain/decisions/decision.model'
import { DecisionEngine } from '../domain/decisions/decision.engine'
import { BehaviorPolicy } from '../domain/behavior/behavior.policy'
import type {
  ExecutionResult,
  ExecutionStepResult,
  RuntimeAction,
  PolicyResult,
} from './execution.model'
import { MarketBalanceService } from '../ai/marketBalance.service'
import { logger } from '../utils/logger'
import { FeatureFlags } from './featureFlags'
import { executeWithFirewall } from '../integrations/firewall'
import { ExternalAIService } from '../integrations/ai'
import { safetyLayer } from './pipeline/safetyLayer'

/**
 * Pipeline input
 */
export interface PipelineInput {
  rawEvent: RawEvent
  user?: User | null
  profile?: UserProfile | null
  listings?: (ListingCard | Listing)[]
  activeUsers?: UserProfile[]
  currentListingId?: string | null
  marketSegment?: MarketSegment
  strategyInput?: StrategyInput
}

/**
 * Run the full pipeline
 */
export async function runPipeline(input: PipelineInput): Promise<ExecutionResult> {
  const steps: ExecutionStepResult[] = []
  const startTime = Date.now()

  // 1) Normalize event
  const normalizedEvent = await runStep('normalize_event', steps, () =>
    normalizeEvent(input.rawEvent)
  )

  // 2) Build context
  const context = await runStep('build_context', steps, () =>
    buildGlobalContext(input, normalizedEvent.name)
  )

  // 3) Calculate market
  const market = await runStep('calculate_market', steps, () =>
    calculateMarket(input)
  )

  // 4) Rank listings
  const ranking = await runStep('rank_listings', steps, () =>
    rankListings(input, context)
  )

  // 5) Resolve strategy
  const strategy = await runStep('resolve_strategy', steps, () =>
    resolveStrategy(input, market)
  )

  // 5.5) Safety layer
  await runStep('safety_check', steps, () => safetyLayer())

  // 6) Resolve decision
  const decision = await runStep('resolve_decision', steps, () =>
    resolveDecision(context, strategy, ranking, market)
  )

  // 7) Apply policies
  const policies = await runStep('apply_policies', steps, () =>
    applyPolicies(input, context, strategy)
  )

  // 8) Produce actions
  const actions = await runStep('produce_actions', steps, () =>
    produceActions(decision, policies)
  )

  return {
    rawEvent: input.rawEvent,
    normalizedEvent,
    context,
    market,
    ranking,
    strategy,
    decision,
    policies,
    actions,
    steps,
    totalDurationMs: Date.now() - startTime,
  }
}

// ==========================================
// PIPELINE STEPS
// ==========================================

async function buildGlobalContext(
  input: PipelineInput,
  eventName: string
): Promise<GlobalContext> {
  const decisionInput: DecisionInput = {
    userId: input.user?.id || input.profile?.userId,
    source: input.rawEvent.source,
    event: eventName,
    payload: input.rawEvent.data,
    sessionId: (input.rawEvent.data?.sessionId as string) || undefined,
    timestamp: input.rawEvent.timestamp,
  }

  const aiSignals = await resolveAISignals(input)

  return buildContext(decisionInput, input.user || null, input.profile || null, {
    currentListingId: input.currentListingId || null,
    aiSignals,
  })
}

function calculateMarket(input: PipelineInput): MarketState | null {
  const listings = input.listings || []
  const users = input.activeUsers || []

  if (listings.length === 0 && users.length === 0) {
    return null
  }

  const segment = input.marketSegment || {
    id: 'global',
    name: 'Global',
    city: '',
  }

  return MarketService.calculateMarketState(segment, listings, users)
}

function rankListings(
  input: PipelineInput,
  context: GlobalContext
): RankingResult | null {
  if (!input.listings || input.listings.length === 0) {
    return null
  }

  return RankingService.rankListings(input.listings, context.profile)
}

function resolveStrategy(
  input: PipelineInput,
  market: MarketState | null
): StrategyOutput {
  if (input.strategyInput) {
    return ProductStrategy.resolve(input.strategyInput)
  }

  const listings = input.listings || []
  const users = input.activeUsers || []
  const balance = listings.length > 0 || users.length > 0
    ? MarketBalanceService.evaluate(listings, users)
    : undefined

  return ProductStrategy.resolve({ marketBalance: balance })
}

function resolveDecision(
  context: GlobalContext,
  strategy: StrategyOutput,
  ranking: RankingResult | null,
  market: MarketState | null
): DecisionResult {
  const marketPressure = market ? calculateMarketPressure(market).score : undefined
  const competitionLevel = market?.competitionLevel === 'extreme'
    ? 'high'
    : market?.competitionLevel

  const decisionContext: DecisionContext = createDecisionContext({
    profile: context.profile,
    productState: context.productState,
    isAuthenticated: context.isAuthenticated,
    isOwner: context.isOwner,
    currentListingId: context.currentListingId || undefined,
    ranking: ranking?.rankings,
    competitionLevel,
    marketPressure,
    strategyMode: strategy.config.mode,
    monetizationLevel: strategy.config.monetizationLevel,
    aiSignals: context.aiSignals || null,
  })

  return DecisionEngine.resolveDecisions(decisionContext)
}

function applyPolicies(
  input: PipelineInput,
  context: GlobalContext,
  strategy: StrategyOutput
): PolicyResult {
  const user = context.user
  const profile = context.profile
  const listing = input.listings?.[0]

  const contactPolicy = listing
    ? BehaviorPolicy.shouldLimitContacts(user, profile, listing)
    : { allowed: true }

  const paymentPolicy = BehaviorPolicy.shouldRequirePayment(
    user,
    profile,
    strategy.config.monetizationLevel
  )

  const favoritePolicy = BehaviorPolicy.checkFavoritesLimit(user, profile)

  const searchPolicy = BehaviorPolicy.checkSearchLimit(user, 0)

  const reasons: string[] = []
  if (!contactPolicy.allowed && contactPolicy.reason) reasons.push(contactPolicy.reason)
  if (!paymentPolicy.allowed && paymentPolicy.reason) reasons.push(paymentPolicy.reason)
  if (!favoritePolicy.allowed && favoritePolicy.reason) reasons.push(favoritePolicy.reason)
  if (!searchPolicy.allowed && searchPolicy.reason) reasons.push(searchPolicy.reason)

  return {
    allowContact: contactPolicy.allowed,
    allowPayment: paymentPolicy.allowed,
    allowFavorite: favoritePolicy.allowed,
    allowSearch: searchPolicy.allowed,
    reasons,
  }
}

function produceActions(
  decision: DecisionResult,
  policies: PolicyResult
): RuntimeAction[] {
  const actions: RuntimeAction[] = []

  if (decision.primaryDecision) {
    actions.push({
      type: `decision:${decision.primaryDecision.type}`,
      payload: decision.primaryDecision.params,
      source: 'decision_engine',
      priority: decision.primaryDecision.priority,
    })
  }

  if (!policies.allowContact) {
    actions.push({
      type: 'policy:block_contact',
      payload: { reasons: policies.reasons },
      source: 'behavior_policy',
      priority: 'high',
    })
  }

  if (!policies.allowPayment) {
    actions.push({
      type: 'policy:block_payment',
      payload: { reasons: policies.reasons },
      source: 'behavior_policy',
      priority: 'high',
    })
  }

  return actions
}

// ==========================================
// STEP WRAPPER
// ==========================================

async function runStep<T>(
  stage: ExecutionStepResult['stage'],
  steps: ExecutionStepResult[],
  fn: () => T | Promise<T>
): Promise<T> {
  const startedAt = Date.now()
  try {
    const result = await fn()
    const endedAt = Date.now()
    steps.push({
      stage,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      ok: true,
    })
    return result
  } catch (error) {
    const endedAt = Date.now()
    const message = error instanceof Error ? error.message : 'Unknown error'
    steps.push({
      stage,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      ok: false,
      error: message,
    })
    logger.error('ExecutionPipeline', `Stage failed: ${stage}`, error)
    throw error
  }
}

async function resolveAISignals(
  input: PipelineInput
): Promise<Record<string, unknown> | null> {
  if (!FeatureFlags.isEnabled('AI_ENABLED')) {
    return null
  }

  const listing = input.listings?.[0]
  if (!listing) return null

  return executeWithFirewall(
    'ai',
    'analyze_listing',
    async () => {
      const analysis = await ExternalAIService.analyzeContext({ listing })
      return analysis || deterministicAISignals(listing)
    },
    {
      fallback: async () => deterministicAISignals(listing),
    }
  )
}

function deterministicAISignals(listing: ListingCard | Listing): Record<string, unknown> {
  const baseScore = listing.intelligence?.score ?? 0
  return {
    analysis: {
      listingId: listing.id,
      qualityScore: baseScore,
      demandLevel: listing.intelligence?.verdict || 'unknown',
      reasons: listing.intelligence?.reasons || [],
      source: 'deterministic',
    },
  }
}

export const ExecutionPipeline = {
  run: runPipeline,
}

export default ExecutionPipeline
