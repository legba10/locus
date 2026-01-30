/**
 * LOCUS Metrics Module
 *
 * PATCH 10: Real Product Activation
 */

export type { RealMetricSnapshot } from './realMetrics'
export {
  recordRealEvent,
  updateActiveUsers,
  getRealMetrics,
  resetRealMetrics,
  RealMetrics,
} from './realMetrics'

export type { MetricsComparison } from './simulationCompare'
export { compareSimulationToReal, SimulationCompare } from './simulationCompare'
