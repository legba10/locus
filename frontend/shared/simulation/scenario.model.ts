/**
 * LOCUS Simulation Scenario Model
 *
 * PATCH 9: Real World Simulation Engine
 *
 * Defines scenario steps and results for deterministic replay.
 */

import type { RawEvent } from '../events/event.types'
import type { SystemState } from '../runtime/systemState'

export type ScenarioStepType =
  | 'event'
  | 'market_update'
  | 'system_state'
  | 'integration_failure'
  | 'delay'

export interface ScenarioStepBase {
  id: string
  type: ScenarioStepType
  label?: string
}

export interface EventStep extends ScenarioStepBase {
  type: 'event'
  event: RawEvent
}

export interface MarketUpdateStep extends ScenarioStepBase {
  type: 'market_update'
  listingDelta?: number
  demandDelta?: number
}

export interface SystemStateStep extends ScenarioStepBase {
  type: 'system_state'
  state: SystemState
  reason?: string
}

export interface IntegrationFailureStep extends ScenarioStepBase {
  type: 'integration_failure'
  integration: 'telegram' | 'ai' | 'payments'
  mode: 'timeout' | 'error' | 'rate_limit'
}

export interface DelayStep extends ScenarioStepBase {
  type: 'delay'
  ms: number
}

export type ScenarioStep =
  | EventStep
  | MarketUpdateStep
  | SystemStateStep
  | IntegrationFailureStep
  | DelayStep

export interface Scenario {
  id: string
  name: string
  seed: number
  steps: ScenarioStep[]
  tags?: string[]
}

export interface ScenarioResult {
  scenarioId: string
  ok: boolean
  errors: string[]
  executedSteps: number
  totalDurationMs: number
  decisions: string[]
}

export interface SimulationReport {
  ok: boolean
  totalScenarios: number
  passed: number
  failed: number
  errors: string[]
}
