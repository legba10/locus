/**
 * LOCUS Runtime Execution Model
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Defines the execution model for system pipelines.
 */

import type { RawEvent, NormalizedEvent } from '../events/event.types'
import type { GlobalContext } from '../context/context.types'
import type { MarketState } from '../domain/market/market.model'
import type { RankingResult } from '../domain/ranking.model'
import type { StrategyOutput } from '../domain/strategy/product.strategy'
import type { DecisionResult } from '../domain/decisions/decision.model'

/**
 * Pipeline stage names
 */
export type ExecutionStage =
  | 'normalize_event'
  | 'build_context'
  | 'calculate_market'
  | 'rank_listings'
  | 'resolve_strategy'
  | 'safety_check'
  | 'resolve_decision'
  | 'apply_policies'
  | 'produce_actions'
  | 'state_change'

/**
 * Execution step result
 */
export interface ExecutionStepResult {
  stage: ExecutionStage
  startedAt: number
  endedAt: number
  durationMs: number
  ok: boolean
  error?: string
}

/**
 * Execution result
 */
export interface PolicyResult {
  allowContact: boolean
  allowPayment: boolean
  allowFavorite: boolean
  allowSearch: boolean
  reasons: string[]
}

export interface ExecutionResult {
  rawEvent: RawEvent
  normalizedEvent: NormalizedEvent
  context: GlobalContext
  market: MarketState | null
  ranking: RankingResult | null
  strategy: StrategyOutput
  decision: DecisionResult
  policies: PolicyResult
  actions: RuntimeAction[]
  steps: ExecutionStepResult[]
  totalDurationMs: number
}

/**
 * Runtime action
 */
export interface RuntimeAction {
  type: string
  payload?: Record<string, unknown>
  source?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}
