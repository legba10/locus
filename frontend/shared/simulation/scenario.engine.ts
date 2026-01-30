/**
 * LOCUS Scenario Engine
 *
 * PATCH 9: Real World Simulation Engine
 *
 * Executes scenarios using runtime pipeline.
 */

import type { Scenario, ScenarioResult } from './scenario.model'
import type { PipelineInput } from '../runtime/pipeline'
import { runPipeline } from '../runtime/pipeline'
import { setSystemState } from '../runtime/systemState'
import { executeWithFirewall } from '../integrations/firewall'
import { TelemetryLogger } from '../runtime/telemetry/logger'
import { createSyntheticListings, createSyntheticUsers } from './syntheticMarket'
import { createSyntheticUser, createSyntheticProfile } from './syntheticUser'

export interface ScenarioEngineOptions {
  baseCity?: string
}

export async function runScenario(
  scenario: Scenario,
  options?: ScenarioEngineOptions
): Promise<ScenarioResult> {
  const errors: string[] = []
  const decisions: string[] = []
  const startTime = Date.now()
  const city = options?.baseCity || 'Москва'

  // Seeded random generator
  const random = createSeededRandom(scenario.seed)

  // Prepare synthetic environment
  const listings = createSyntheticListings({ city, count: 20 }, random)
  const activeUsers = createSyntheticUsers(10, city)
  const user = createSyntheticUser({ id: `u_${scenario.id}` })
  const profile = createSyntheticProfile(user.id, { city, intentConfidence: 0.4 })

  let executed = 0

  for (const step of scenario.steps) {
    executed += 1
    try {
      switch (step.type) {
        case 'event': {
          const input: PipelineInput = {
            rawEvent: step.event,
            user,
            profile,
            listings,
            activeUsers,
            currentListingId: listings[0]?.id,
          }
          const result = await runPipeline(input)
          if (result.decision.primaryDecision?.type) {
            decisions.push(result.decision.primaryDecision.type)
          }
          break
        }

        case 'market_update': {
          const delta = step.listingDelta || 0
          if (delta > 0) {
            listings.push(
              ...createSyntheticListings({ city, count: delta }, random)
            )
          } else if (delta < 0) {
            listings.splice(0, Math.min(listings.length, Math.abs(delta)))
          }
          break
        }

        case 'system_state': {
          setSystemState(step.state, step.reason)
          break
        }

        case 'integration_failure': {
          await executeWithFirewall(
            step.integration,
            'simulate_failure',
            async () => {
              if (step.mode === 'timeout') {
                await sleep(20)
                throw new Error('Simulated timeout')
              }
              if (step.mode === 'rate_limit') {
                throw new Error('Simulated rate limit')
              }
              throw new Error('Simulated integration error')
            },
            {
              fallback: async () => {
                TelemetryLogger.logIntegration(step.integration, 'fallback', {
                  scenario: scenario.id,
                })
                return true
              },
            }
          )
          break
        }

        case 'delay': {
          await sleep(step.ms)
          break
        }

        default:
          break
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Step ${step.id}: ${message}`)
    }
  }

  return {
    scenarioId: scenario.id,
    ok: errors.length === 0,
    errors,
    executedSteps: executed,
    totalDurationMs: Date.now() - startTime,
    decisions,
  }
}

export async function runScenarioBatch(
  scenarios: Scenario[]
): Promise<{ results: ScenarioResult[]; ok: boolean }> {
  const results: ScenarioResult[] = []
  let ok = true

  for (const scenario of scenarios) {
    const result = await runScenario(scenario)
    results.push(result)
    if (!result.ok) ok = false
  }

  return { results, ok }
}

// ==========================================
// UTILS
// ==========================================

function createSeededRandom(seed: number): () => number {
  let t = seed
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
