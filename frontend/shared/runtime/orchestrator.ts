/**
 * LOCUS Orchestrator
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Central coordinator for runtime execution pipeline.
 */

import { logger } from '../utils/logger'
import { ExecutionPipeline } from './pipeline'
import type { PipelineInput } from './pipeline'
import type { ExecutionResult } from './execution.model'
import { SystemStateMachine } from './systemState'
import { TelemetryLogger } from './telemetry/logger'
import { TelemetryMetrics } from './telemetry/metrics'
import { TelemetryTracer } from './telemetry/tracer'

/**
 * Orchestrate a full execution cycle
 */
export async function runOrchestration(
  input: PipelineInput
): Promise<ExecutionResult> {
  const span = TelemetryTracer.startSpan('orchestrator.run', {
    source: input.rawEvent.source,
    event: input.rawEvent.type,
  })

  TelemetryMetrics.increment('orchestrator_runs_total', 1, {
    source: input.rawEvent.source,
  })

  // System state checks
  const state = SystemStateMachine.get()
  if (state === 'overload') {
    logger.warn('Orchestrator', 'System overload, running minimal pipeline')
  }

  try {
    const result = await ExecutionPipeline.run(input)

    TelemetryMetrics.timing('orchestrator_duration_ms', result.totalDurationMs, {
      source: input.rawEvent.source,
    })

    TelemetryLogger.logStrategy(result.strategy)
    TelemetryLogger.logDecision(result.decision)

    span.end()
    return result
  } catch (error) {
    span.end()
    TelemetryLogger.logError(error, {
      source: input.rawEvent.source,
      event: input.rawEvent.type,
    })
    TelemetryMetrics.increment('orchestrator_errors_total', 1, {
      source: input.rawEvent.source,
    })
    throw error
  }
}

/**
 * Safe orchestration with fallback
 */
export async function runOrchestrationSafe(
  input: PipelineInput,
  fallback?: (error: unknown) => ExecutionResult
): Promise<ExecutionResult> {
  try {
    return await runOrchestration(input)
  } catch (error) {
    logger.error('Orchestrator', 'Pipeline failed, fallback used', error)
    if (fallback) {
      return fallback(error)
    }
    throw error
  }
}

export const Orchestrator = {
  run: runOrchestration,
  runSafe: runOrchestrationSafe,
}

export default Orchestrator
