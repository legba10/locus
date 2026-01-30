/**
 * LOCUS Simulation vs Real Metrics Compare
 *
 * PATCH 10: Real Product Activation
 */

import type { SimulationReport } from '../simulation/scenario.model'
import type { RealMetricSnapshot } from './realMetrics'

export interface MetricsComparison {
  ok: boolean
  driftScore: number
  notes: string[]
}

export function compareSimulationToReal(
  simulation: SimulationReport,
  real: RealMetricSnapshot
): MetricsComparison {
  const notes: string[] = []
  let drift = 0

  if (!simulation.ok) {
    notes.push('Simulation failed scenarios')
    drift += 0.3
  }

  if (real.listingViews === 0 && real.activeUsers > 0) {
    notes.push('No listing views in real usage')
    drift += 0.2
  }

  if (real.logins === 0 && real.activeUsers > 0) {
    notes.push('No logins observed')
    drift += 0.2
  }

  const ok = drift < 0.5
  return { ok, driftScore: Math.min(1, drift), notes }
}

export const SimulationCompare = {
  compare: compareSimulationToReal,
}

export default SimulationCompare
