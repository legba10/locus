/**
 * LOCUS Runtime Module
 *
 * PATCH 8: System Runtime & Orchestration
 */

export type {
  ExecutionStage,
  ExecutionStepResult,
  ExecutionResult,
  RuntimeAction,
  PolicyResult,
} from './execution.model'

export { runPipeline, ExecutionPipeline } from './pipeline'
export type { PipelineInput } from './pipeline'

export { runOrchestration, runOrchestrationSafe, Orchestrator } from './orchestrator'

export type { SystemState, SystemStateSnapshot } from './systemState'
export {
  getSystemState,
  setSystemState,
  getSystemStateSnapshot,
  getSystemStateHistory,
  isIntegrationAllowed,
  isDegraded,
  isOverloaded,
  isSandbox,
  isExperimental,
  SystemStateMachine,
} from './systemState'

export type { TelemetryLogEntry } from './telemetry/logger'
export {
  logDecision,
  logStrategy,
  logIntegration,
  logError,
  getTelemetryLogs,
  clearTelemetryLogs,
  TelemetryLogger,
} from './telemetry/logger'

export type { MetricEntry, MetricType } from './telemetry/metrics'
export {
  increment,
  gauge,
  timing,
  getMetrics,
  clearMetrics,
  TelemetryMetrics,
} from './telemetry/metrics'

export type { Span } from './telemetry/tracer'
export {
  startSpan,
  getSpans,
  clearSpans,
  TelemetryTracer,
} from './telemetry/tracer'

export * from './replay'

export * from './flow'

export type { FeatureFlag } from './featureFlags'
export {
  isFeatureEnabled,
  setFeatureFlag,
  getFeatureFlags,
  disableAllFeatures,
  getEnvironmentAwareFlags,
  applyEnvironmentFlags,
  FeatureFlags,
} from './featureFlags'

export type { AppEnv } from './env/env.model'
export { getAppEnv } from './env/env.resolver'
export { validateEnv } from './env/env.validator'

export { getDeployConfig } from './deploy/deploy.config'

export type { IntegrationKey, IntegrationRule } from './integrationControl/integrationMatrix'
export { IntegrationMatrix } from './integrationControl/integrationMatrix'
export {
  enableIntegration,
  disableIntegration,
  canEnableIntegration,
  getIntegrationRules,
  IntegrationControl,
} from './integrationControl/integrationControl'
export { checkIntegrationSafety, IntegrationGuard } from './integrationControl/integrationGuard'

export { getIntegrationStatus, IntegrationStatus } from './integrationStatus'
