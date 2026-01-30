/**
 * LOCUS Events Module
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Unified event handling for all sources.
 */

export type {
  RawEventSource,
  RawEvent,
  NormalizedEvent,
  EventHandler,
  EventSubscription,
  CommonEventName,
} from './event.types'

export {
  normalizeEvent,
  normalizeEvents,
  subscribe,
  unsubscribe,
  dispatch,
  processEvent,
  getHistory,
  clearHistory,
  getSubscriptionCount,
  createRawEvent,
  EventNormalizer,
} from './event.normalizer'
