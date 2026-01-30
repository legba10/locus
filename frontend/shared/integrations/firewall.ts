/**
 * LOCUS Integration Firewall
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Provides rate limiting, timeouts, retries, and circuit breaker.
 */

import { logger } from '../utils/logger'
import { SystemStateMachine } from '../runtime/systemState'
import { TelemetryLogger } from '../runtime/telemetry/logger'
import { TelemetryMetrics } from '../runtime/telemetry/metrics'

export type CircuitState = 'closed' | 'open' | 'half_open'

export interface FirewallConfig {
  rateLimit: {
    windowMs: number
    maxRequests: number
  }
  timeoutMs: number
  retry: {
    attempts: number
    backoffMs: number
  }
  circuitBreaker: {
    failureThreshold: number
    successThreshold: number
    openTimeoutMs: number
  }
}

export interface FirewallState {
  integration: string
  circuitState: CircuitState
  failures: number
  successes: number
  lastFailureAt?: number
  lastOpenedAt?: number
  windowStart: number
  windowCount: number
}

const DEFAULT_CONFIG: FirewallConfig = {
  rateLimit: { windowMs: 60_000, maxRequests: 60 },
  timeoutMs: 10_000,
  retry: { attempts: 1, backoffMs: 200 },
  circuitBreaker: { failureThreshold: 3, successThreshold: 2, openTimeoutMs: 30_000 },
}

const states = new Map<string, FirewallState>()
const configs = new Map<string, FirewallConfig>()

function getState(integration: string): FirewallState {
  const existing = states.get(integration)
  if (existing) return existing

  const now = Date.now()
  const state: FirewallState = {
    integration,
    circuitState: 'closed',
    failures: 0,
    successes: 0,
    windowStart: now,
    windowCount: 0,
  }
  states.set(integration, state)
  return state
}

export function configureFirewall(
  integration: string,
  config: Partial<FirewallConfig>
): void {
  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
    rateLimit: { ...DEFAULT_CONFIG.rateLimit, ...config.rateLimit },
    retry: { ...DEFAULT_CONFIG.retry, ...config.retry },
    circuitBreaker: { ...DEFAULT_CONFIG.circuitBreaker, ...config.circuitBreaker },
  }
  configs.set(integration, merged)
}

export function getFirewallConfig(integration: string): FirewallConfig {
  return configs.get(integration) || DEFAULT_CONFIG
}

export function getFirewallState(integration: string): FirewallState {
  return { ...getState(integration) }
}

function checkRateLimit(state: FirewallState, config: FirewallConfig): boolean {
  const now = Date.now()
  if (now - state.windowStart >= config.rateLimit.windowMs) {
    state.windowStart = now
    state.windowCount = 0
  }

  if (state.windowCount >= config.rateLimit.maxRequests) {
    return false
  }

  state.windowCount += 1
  return true
}

function updateCircuitOnSuccess(state: FirewallState, config: FirewallConfig): void {
  state.failures = 0
  state.successes += 1
  if (state.circuitState === 'half_open' && state.successes >= config.circuitBreaker.successThreshold) {
    state.circuitState = 'closed'
    state.successes = 0
  }
}

function updateCircuitOnFailure(state: FirewallState, config: FirewallConfig): void {
  state.failures += 1
  state.successes = 0
  state.lastFailureAt = Date.now()

  if (state.failures >= config.circuitBreaker.failureThreshold) {
    state.circuitState = 'open'
    state.lastOpenedAt = Date.now()
  }
}

function canAttempt(state: FirewallState, config: FirewallConfig): boolean {
  if (state.circuitState === 'closed') return true

  if (state.circuitState === 'open') {
    const elapsed = Date.now() - (state.lastOpenedAt || 0)
    if (elapsed >= config.circuitBreaker.openTimeoutMs) {
      state.circuitState = 'half_open'
      return true
    }
    return false
  }

  return true
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Integration timeout')), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function executeWithFirewall<T>(
  integration: string,
  operation: string,
  fn: () => Promise<T>,
  options?: {
    fallback?: () => Promise<T> | T
    config?: Partial<FirewallConfig>
    enforceSystemState?: boolean
  }
): Promise<T> {
  if (options?.config) {
    configureFirewall(integration, options.config)
  }

  const config = getFirewallConfig(integration)
  const state = getState(integration)

  if (options?.enforceSystemState !== false && !SystemStateMachine.isIntegrationAllowed()) {
    TelemetryLogger.logIntegration(integration, 'blocked_by_system_state', { state: SystemStateMachine.get() })
    if (options?.fallback) {
      return await options.fallback()
    }
    throw new Error(`Integration blocked by system state: ${SystemStateMachine.get()}`)
  }

  if (!checkRateLimit(state, config)) {
    TelemetryMetrics.increment('integration_rate_limited_total', 1, { integration })
    if (options?.fallback) {
      TelemetryLogger.logIntegration(integration, 'rate_limited_fallback')
      return await options.fallback()
    }
    throw new Error(`Rate limit exceeded for ${integration}`)
  }

  if (!canAttempt(state, config)) {
    TelemetryMetrics.increment('integration_circuit_open_total', 1, { integration })
    if (options?.fallback) {
      TelemetryLogger.logIntegration(integration, 'circuit_open_fallback')
      return await options.fallback()
    }
    throw new Error(`Circuit open for ${integration}`)
  }

  const attempts = Math.max(0, config.retry.attempts)
  let lastError: unknown

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      const result = await withTimeout(fn(), config.timeoutMs)
      updateCircuitOnSuccess(state, config)
      TelemetryMetrics.increment('integration_success_total', 1, { integration })
      return result
    } catch (error) {
      lastError = error
      updateCircuitOnFailure(state, config)
      TelemetryMetrics.increment('integration_failure_total', 1, { integration })
      TelemetryLogger.logIntegration(integration, 'failure', {
        operation,
        attempt,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      if (attempt < attempts) {
        await sleep(config.retry.backoffMs)
      }
    }
  }

  if (options?.fallback) {
    TelemetryLogger.logIntegration(integration, 'fallback_used', { operation })
    return await options.fallback()
  }

  logger.error('IntegrationFirewall', `Integration failed: ${integration}`, lastError)
  throw lastError instanceof Error ? lastError : new Error('Integration failed')
}

export function resetFirewallState(integration?: string): void {
  if (integration) {
    states.delete(integration)
    return
  }
  states.clear()
}

export const IntegrationFirewall = {
  execute: executeWithFirewall,
  configure: configureFirewall,
  getConfig: getFirewallConfig,
  getState: getFirewallState,
  reset: resetFirewallState,
}

export default IntegrationFirewall
