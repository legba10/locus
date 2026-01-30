/**
 * LOCUS Event Normalizer
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Normalizes events from all sources to unified format.
 */

import { logger } from '../utils/logger'
import type {
  RawEvent,
  RawEventSource,
  NormalizedEvent,
  EventHandler,
  EventSubscription,
} from './event.types'

/**
 * Event version
 */
const EVENT_VERSION = 1

/**
 * Event subscriptions
 */
const subscriptions: EventSubscription[] = []

/**
 * Event history (for debugging)
 */
const eventHistory: NormalizedEvent[] = []
const MAX_HISTORY = 100

// ==========================================
// NORMALIZATION
// ==========================================

/**
 * Generate event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Normalize event name
 */
function normalizeEventName(rawType: string, source: RawEventSource): string {
  // Remove source prefix if present
  let name = rawType.toLowerCase()
    .replace(/^(ui_|telegram_|ai_|payment_|system_)/, '')
    .replace(/-/g, '_')
  
  // Map common patterns
  const mappings: Record<string, string> = {
    'click': 'interaction',
    'tap': 'interaction',
    'submit': 'action',
    'error': 'system_error',
    'success': 'action_success',
    'fail': 'action_fail',
    'failure': 'action_fail',
  }
  
  for (const [pattern, replacement] of Object.entries(mappings)) {
    if (name.includes(pattern)) {
      name = name.replace(pattern, replacement)
    }
  }
  
  return name
}

/**
 * Normalize raw event
 */
export function normalizeEvent(event: RawEvent): NormalizedEvent {
  const now = Date.now()
  
  const normalized: NormalizedEvent = {
    id: generateEventId(),
    name: normalizeEventName(event.type, event.source),
    source: event.source,
    timestamp: event.timestamp || now,
    userId: event.data?.userId as string | undefined,
    sessionId: event.data?.sessionId as string | undefined,
    data: event.data || {},
    metadata: {
      version: EVENT_VERSION,
      processedAt: now,
      originalType: event.type,
    },
  }
  
  // Add to history
  eventHistory.push(normalized)
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.shift()
  }
  
  logger.debug('EventNormalizer', `Event normalized: ${normalized.name}`, {
    source: normalized.source,
    original: event.type,
  })
  
  return normalized
}

/**
 * Normalize multiple events
 */
export function normalizeEvents(events: RawEvent[]): NormalizedEvent[] {
  return events.map(normalizeEvent)
}

// ==========================================
// EVENT BUS
// ==========================================

/**
 * Subscribe to events
 */
export function subscribe(
  pattern: string | RegExp,
  handler: EventHandler,
  source?: RawEventSource
): string {
  const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  subscriptions.push({
    id,
    pattern,
    handler,
    source,
  })
  
  logger.debug('EventNormalizer', `Subscription added: ${id}`, { pattern: String(pattern) })
  
  return id
}

/**
 * Unsubscribe
 */
export function unsubscribe(subscriptionId: string): boolean {
  const index = subscriptions.findIndex(s => s.id === subscriptionId)
  if (index >= 0) {
    subscriptions.splice(index, 1)
    return true
  }
  return false
}

/**
 * Dispatch event to subscribers
 */
export async function dispatch(event: NormalizedEvent): Promise<void> {
  const matchingSubscriptions = subscriptions.filter(sub => {
    // Check source filter
    if (sub.source && sub.source !== event.source) {
      return false
    }
    
    // Check pattern
    if (typeof sub.pattern === 'string') {
      return event.name === sub.pattern || event.name.startsWith(sub.pattern)
    }
    return sub.pattern.test(event.name)
  })
  
  logger.debug('EventNormalizer', `Dispatching to ${matchingSubscriptions.length} handlers`, {
    event: event.name,
  })
  
  // Execute handlers
  await Promise.all(
    matchingSubscriptions.map(async sub => {
      try {
        await sub.handler(event)
      } catch (error) {
        logger.error('EventNormalizer', `Handler error for ${sub.id}`, error)
      }
    })
  )
}

/**
 * Process raw event (normalize + dispatch)
 */
export async function processEvent(rawEvent: RawEvent): Promise<NormalizedEvent> {
  const normalized = normalizeEvent(rawEvent)
  await dispatch(normalized)
  return normalized
}

// ==========================================
// UTILITIES
// ==========================================

/**
 * Get event history
 */
export function getHistory(limit?: number): NormalizedEvent[] {
  const events = [...eventHistory]
  if (limit) {
    return events.slice(-limit)
  }
  return events
}

/**
 * Clear history
 */
export function clearHistory(): void {
  eventHistory.length = 0
}

/**
 * Get subscriptions count
 */
export function getSubscriptionCount(): number {
  return subscriptions.length
}

/**
 * Create raw event helper
 */
export function createRawEvent(
  source: RawEventSource,
  type: string,
  data?: Record<string, unknown>
): RawEvent {
  return {
    source,
    type,
    data,
    timestamp: Date.now(),
  }
}

// ==========================================
// EXPORTS
// ==========================================

export const EventNormalizer = {
  normalize: normalizeEvent,
  normalizeAll: normalizeEvents,
  subscribe,
  unsubscribe,
  dispatch,
  process: processEvent,
  getHistory,
  clearHistory,
  getSubscriptionCount,
  createRawEvent,
}

export default EventNormalizer
