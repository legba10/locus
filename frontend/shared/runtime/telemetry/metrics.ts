/**
 * LOCUS Runtime Metrics
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Minimal in-memory metrics store.
 */

export type MetricType = 'counter' | 'gauge' | 'timing'

export interface MetricEntry {
  name: string
  type: MetricType
  value: number
  timestamp: number
  tags?: Record<string, string>
}

const metrics: MetricEntry[] = []
const MAX_METRICS = 500

function pushMetric(entry: MetricEntry): void {
  metrics.push(entry)
  if (metrics.length > MAX_METRICS) {
    metrics.shift()
  }
}

export function increment(
  name: string,
  value: number = 1,
  tags?: Record<string, string>
): void {
  pushMetric({
    name,
    type: 'counter',
    value,
    timestamp: Date.now(),
    tags,
  })
}

export function gauge(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  pushMetric({
    name,
    type: 'gauge',
    value,
    timestamp: Date.now(),
    tags,
  })
}

export function timing(
  name: string,
  durationMs: number,
  tags?: Record<string, string>
): void {
  pushMetric({
    name,
    type: 'timing',
    value: durationMs,
    timestamp: Date.now(),
    tags,
  })
}

export function getMetrics(limit?: number): MetricEntry[] {
  if (limit) {
    return metrics.slice(-limit)
  }
  return [...metrics]
}

export function clearMetrics(): void {
  metrics.length = 0
}

export const TelemetryMetrics = {
  increment,
  gauge,
  timing,
  get: getMetrics,
  clear: clearMetrics,
}

export default TelemetryMetrics
