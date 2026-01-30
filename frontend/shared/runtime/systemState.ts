/**
 * LOCUS System State Machine
 *
 * PATCH 8: System Runtime & Orchestration
 *
 * Controls global runtime state and integration availability.
 */

import { logger } from '../utils/logger'
import { setAllModes, resetToSandbox } from '../integrations/sandbox'

export type SystemState =
  | 'stable'
  | 'degraded'
  | 'overload'
  | 'sandbox'
  | 'experimental'

export interface SystemStateSnapshot {
  state: SystemState
  changedAt: number
  reason?: string
}

const history: SystemStateSnapshot[] = []
const MAX_HISTORY = 100

let currentState: SystemState = 'sandbox'
let lastChange = Date.now()

function pushSnapshot(snapshot: SystemStateSnapshot): void {
  history.push(snapshot)
  if (history.length > MAX_HISTORY) {
    history.shift()
  }
}

export function getSystemState(): SystemState {
  return currentState
}

export function setSystemState(state: SystemState, reason?: string): void {
  if (state === currentState) return

  currentState = state
  lastChange = Date.now()

  pushSnapshot({
    state,
    changedAt: lastChange,
    reason,
  })

  logger.warn('SystemState', `State changed to: ${state}`, { reason })

  // Apply integration safety rules
  applyIntegrationRules(state)
}

export function getSystemStateSnapshot(): SystemStateSnapshot {
  return { state: currentState, changedAt: lastChange }
}

export function getSystemStateHistory(limit?: number): SystemStateSnapshot[] {
  if (limit) return history.slice(-limit)
  return [...history]
}

export function isIntegrationAllowed(): boolean {
  return currentState === 'stable' || currentState === 'experimental'
}

export function isDegraded(): boolean {
  return currentState === 'degraded'
}

export function isOverloaded(): boolean {
  return currentState === 'overload'
}

export function isSandbox(): boolean {
  return currentState === 'sandbox'
}

export function isExperimental(): boolean {
  return currentState === 'experimental'
}

function applyIntegrationRules(state: SystemState): void {
  if (state === 'stable' || state === 'experimental') {
    // Allow integrations, but keep explicit control elsewhere
    return
  }

  // For sandbox/degraded/overload: force sandbox
  setAllModes('sandbox')
  resetToSandbox()
}

export const SystemStateMachine = {
  get: getSystemState,
  set: setSystemState,
  snapshot: getSystemStateSnapshot,
  history: getSystemStateHistory,
  isIntegrationAllowed,
  isDegraded,
  isOverloaded,
  isSandbox,
  isExperimental,
}

export default SystemStateMachine
