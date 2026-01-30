/**
 * LOCUS Scenario Library
 *
 * PATCH 9: Real World Simulation Engine
 *
 * Provides a set of deterministic scenarios (100+).
 */

import type { Scenario, ScenarioStep } from './scenario.model'
import { createSyntheticEvent } from './syntheticMarket'

const BASE_CITY = 'Москва'

function buildScenario(id: string, seed: number, steps: ScenarioStep[], tags?: string[]): Scenario {
  return { id, name: `Scenario ${id}`, seed, steps, tags }
}

function eventStep(id: string, type: string, data?: Record<string, unknown>): ScenarioStep {
  return {
    id,
    type: 'event',
    event: createSyntheticEvent('ui', type, data),
  }
}

function marketSpike(id: string, listingDelta: number): ScenarioStep {
  return { id, type: 'market_update', listingDelta }
}

function systemState(id: string, state: 'stable' | 'degraded' | 'overload' | 'sandbox' | 'experimental'): ScenarioStep {
  return { id, type: 'system_state', state }
}

function integrationFailure(id: string, integration: 'telegram' | 'ai' | 'payments', mode: 'timeout' | 'error' | 'rate_limit'): ScenarioStep {
  return { id, type: 'integration_failure', integration, mode }
}

function delay(id: string, ms: number): ScenarioStep {
  return { id, type: 'delay', ms }
}

export function getScenarioLibrary(): Scenario[] {
  const scenarios: Scenario[] = []

  // Core user flow scenarios
  for (let i = 0; i < 60; i += 1) {
    scenarios.push(
      buildScenario(
        `core_${i}`,
        1000 + i,
        [
          eventStep(`s${i}_enter`, 'user_enter', { city: BASE_CITY }),
          eventStep(`s${i}_view`, 'listing_view', { listingId: `listing_${i}` }),
          eventStep(`s${i}_fav`, 'favorite_add', { listingId: `listing_${i}` }),
          eventStep(`s${i}_contact`, 'contact_view', { listingId: `listing_${i}` }),
        ],
        ['core', 'user_flow']
      )
    )
  }

  // Strategy shift scenarios
  for (let i = 0; i < 20; i += 1) {
    scenarios.push(
      buildScenario(
        `strategy_${i}`,
        2000 + i,
        [
          eventStep(`st${i}_start`, 'search_execute', { query: '1к Москва' }),
          marketSpike(`st${i}_market`, i % 2 === 0 ? -10 : 15),
          eventStep(`st${i}_view`, 'listing_view', { listingId: `listing_${i}` }),
        ],
        ['strategy', 'market']
      )
    )
  }

  // Chaos scenarios
  for (let i = 0; i < 20; i += 1) {
    scenarios.push(
      buildScenario(
        `chaos_${i}`,
        3000 + i,
        [
          systemState(`c${i}_state`, i % 2 === 0 ? 'degraded' : 'overload'),
          integrationFailure(`c${i}_ai`, 'ai', i % 3 === 0 ? 'timeout' : 'error'),
          integrationFailure(`c${i}_tg`, 'telegram', 'rate_limit'),
          eventStep(`c${i}_event`, 'listing_view', { listingId: `listing_${i}` }),
          delay(`c${i}_delay`, 5),
          systemState(`c${i}_recover`, 'stable'),
        ],
        ['chaos', 'stress']
      )
    )
  }

  // Ensure 100+ scenarios
  while (scenarios.length < 120) {
    const idx = scenarios.length
    scenarios.push(
      buildScenario(
        `extra_${idx}`,
        4000 + idx,
        [
          eventStep(`e${idx}_enter`, 'user_enter', { city: BASE_CITY }),
          eventStep(`e${idx}_view`, 'listing_view', { listingId: `listing_${idx}` }),
        ],
        ['extra']
      )
    )
  }

  return scenarios
}
