/**
 * LOCUS Real Metrics Layer
 *
 * PATCH 10: Real Product Activation
 *
 * Tracks real user metrics for comparison with simulations.
 */

import type { NormalizedEvent } from '../events/event.types'

export interface RealMetricSnapshot {
  timestamp: number
  activeUsers: number
  listingViews: number
  favorites: number
  contacts: number
  logins: number
  logouts: number
}

const metricsState: RealMetricSnapshot = {
  timestamp: Date.now(),
  activeUsers: 0,
  listingViews: 0,
  favorites: 0,
  contacts: 0,
  logins: 0,
  logouts: 0,
}

export function recordRealEvent(event: NormalizedEvent): void {
  metricsState.timestamp = Date.now()
  switch (event.name) {
    case 'listing_view':
      metricsState.listingViews += 1
      break
    case 'favorite_add':
      metricsState.favorites += 1
      break
    case 'contact_view':
    case 'contact_call':
    case 'contact_message':
      metricsState.contacts += 1
      break
    case 'auth_login':
      metricsState.logins += 1
      break
    case 'auth_logout':
      metricsState.logouts += 1
      break
    default:
      break
  }
}

export function updateActiveUsers(count: number): void {
  metricsState.activeUsers = count
  metricsState.timestamp = Date.now()
}

export function getRealMetrics(): RealMetricSnapshot {
  return { ...metricsState }
}

export function resetRealMetrics(): void {
  metricsState.timestamp = Date.now()
  metricsState.activeUsers = 0
  metricsState.listingViews = 0
  metricsState.favorites = 0
  metricsState.contacts = 0
  metricsState.logins = 0
  metricsState.logouts = 0
}

export const RealMetrics = {
  recordEvent: recordRealEvent,
  updateActiveUsers,
  get: getRealMetrics,
  reset: resetRealMetrics,
}

export default RealMetrics
