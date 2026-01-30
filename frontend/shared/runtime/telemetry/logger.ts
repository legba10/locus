/**
 * LOCUS Runtime Telemetry Logger
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Logs strategy, decisions, integrations, and errors.
 */

import { logger } from '../../utils/logger'
import type { StrategyOutput } from '../../domain/strategy/product.strategy'
import type { DecisionResult } from '../../domain/decisions/decision.model'

export interface TelemetryLogEntry {
  type: 'decision' | 'strategy' | 'integration' | 'error'
  message: string
  timestamp: number
  data?: Record<string, unknown>
}

const logBuffer: TelemetryLogEntry[] = []
const MAX_LOGS = 200

function pushLog(entry: TelemetryLogEntry): void {
  logBuffer.push(entry)
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.shift()
  }
}

export function logDecision(result: DecisionResult): void {
  const primary = result.primaryDecision?.type || 'none'
  logger.info('Telemetry', `Decision resolved: ${primary}`, {
    count: result.decisions.length,
    processingTime: result.processingTime,
  })

  pushLog({
    type: 'decision',
    message: `Decision resolved: ${primary}`,
    timestamp: Date.now(),
    data: {
      count: result.decisions.length,
      primary,
      processingTime: result.processingTime,
    },
  })
}

export function logStrategy(strategy: StrategyOutput): void {
  logger.info('Telemetry', `Strategy resolved: ${strategy.config.mode}`, {
    monetization: strategy.config.monetizationLevel,
  })

  pushLog({
    type: 'strategy',
    message: `Strategy resolved: ${strategy.config.mode}`,
    timestamp: Date.now(),
    data: {
      mode: strategy.config.mode,
      monetization: strategy.config.monetizationLevel,
      alerts: strategy.alerts.map(a => a.message),
    },
  })
}

export function logIntegration(
  integration: string,
  event: string,
  data?: Record<string, unknown>
): void {
  logger.debug('Telemetry', `Integration ${integration}: ${event}`, data)
  pushLog({
    type: 'integration',
    message: `Integration ${integration}: ${event}`,
    timestamp: Date.now(),
    data,
  })
}

export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const message = error instanceof Error ? error.message : 'Unknown error'
  logger.error('Telemetry', message, { error, ...context })

  pushLog({
    type: 'error',
    message,
    timestamp: Date.now(),
    data: context,
  })
}

export function getTelemetryLogs(limit?: number): TelemetryLogEntry[] {
  if (limit) {
    return logBuffer.slice(-limit)
  }
  return [...logBuffer]
}

export function clearTelemetryLogs(): void {
  logBuffer.length = 0
}

export const TelemetryLogger = {
  logDecision,
  logStrategy,
  logIntegration,
  logError,
  getLogs: getTelemetryLogs,
  clear: clearTelemetryLogs,
}

export default TelemetryLogger
