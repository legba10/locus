/**
 * LOCUS Analytics Events
 * 
 * PATCH 5: Product Metrics
 * 
 * Event tracking for product growth.
 * Currently logs locally, ready for external services.
 */

import { logger } from '../utils/logger'
import { isClient } from '../utils/isClient'

/**
 * Event categories
 */
export type EventCategory =
  | 'auth'
  | 'listing'
  | 'search'
  | 'favorite'
  | 'navigation'
  | 'error'
  | 'engagement'

/**
 * Predefined event names
 */
export type EventName =
  // Auth events
  | 'auth_start'
  | 'auth_success'
  | 'auth_failure'
  | 'auth_logout'
  | 'session_refresh'
  
  // Listing events
  | 'listing_view'
  | 'listing_create_start'
  | 'listing_create_success'
  | 'listing_edit'
  | 'listing_publish'
  | 'listing_archive'
  | 'listing_delete'
  | 'listing_share'
  | 'listing_contact'
  
  // Search events
  | 'search_start'
  | 'search_results'
  | 'search_empty'
  | 'search_filter_apply'
  | 'search_page_change'
  
  // Favorite events
  | 'favorite_add'
  | 'favorite_remove'
  | 'favorites_view'
  
  // Navigation events
  | 'page_view'
  | 'link_click'
  | 'cta_click'
  
  // Error events
  | 'error_api'
  | 'error_ui'
  | 'error_media'
  
  // Engagement
  | 'time_on_page'
  | 'scroll_depth'

/**
 * Event properties
 */
export interface EventProperties {
  // Common
  timestamp?: string
  sessionId?: string
  userId?: string
  
  // Listing
  listingId?: string
  listingTitle?: string
  listingPrice?: number
  listingCity?: string
  
  // Search
  searchQuery?: string
  searchFilters?: Record<string, unknown>
  resultsCount?: number
  
  // Error
  errorCode?: string
  errorMessage?: string
  
  // Navigation
  pagePath?: string
  referrer?: string
  
  // Custom
  [key: string]: unknown
}

/**
 * Tracked event
 */
export interface TrackedEvent {
  name: EventName | string
  category: EventCategory
  properties: EventProperties
  timestamp: string
}

/**
 * Event queue (for batching)
 */
const eventQueue: TrackedEvent[] = []
const MAX_QUEUE_SIZE = 100

/**
 * Analytics configuration
 */
interface AnalyticsConfig {
  enabled: boolean
  debug: boolean
  batchSize: number
  flushInterval: number
}

const config: AnalyticsConfig = {
  enabled: process.env.NODE_ENV !== 'test',
  debug: process.env.NODE_ENV === 'development',
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
}

/**
 * Session ID (generated once per page load)
 */
let sessionId: string | null = null

function getSessionId(): string {
  if (!sessionId && isClient()) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  return sessionId || 'unknown'
}

/**
 * Track event
 */
export function track(
  name: EventName | string,
  properties: EventProperties = {}
): void {
  if (!config.enabled) return

  const event: TrackedEvent = {
    name,
    category: getCategoryFromName(name),
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    },
    timestamp: new Date().toISOString(),
  }

  // Add to queue
  eventQueue.push(event)
  
  // Debug log
  if (config.debug) {
    logger.debug('Analytics', `[${event.category}] ${name}`, properties)
  }

  // Flush if queue is full
  if (eventQueue.length >= config.batchSize) {
    flush()
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  track('page_view', {
    pagePath: path,
    pageTitle: title,
    referrer: isClient() ? document.referrer : undefined,
  })
}

/**
 * Track listing view
 */
export function trackListingView(listing: {
  id: string
  title?: string
  price?: number
  city?: string
}): void {
  track('listing_view', {
    listingId: listing.id,
    listingTitle: listing.title,
    listingPrice: listing.price,
    listingCity: listing.city,
  })
}

/**
 * Track search
 */
export function trackSearch(
  query: string,
  filters: Record<string, unknown>,
  resultsCount: number
): void {
  track(resultsCount > 0 ? 'search_results' : 'search_empty', {
    searchQuery: query,
    searchFilters: filters,
    resultsCount,
  })
}

/**
 * Track favorite action
 */
export function trackFavorite(
  action: 'add' | 'remove',
  listingId: string
): void {
  track(action === 'add' ? 'favorite_add' : 'favorite_remove', {
    listingId,
  })
}

/**
 * Track error
 */
export function trackError(
  code: string,
  message: string,
  context?: Record<string, unknown>
): void {
  track('error_api', {
    errorCode: code,
    errorMessage: message,
    ...context,
  })
}

/**
 * Track auth event
 */
export function trackAuth(
  event: 'success' | 'failure' | 'logout',
  userId?: string,
  error?: string
): void {
  track(`auth_${event}` as EventName, {
    userId,
    errorMessage: error,
  })
}

/**
 * Get category from event name
 */
function getCategoryFromName(name: string): EventCategory {
  if (name.startsWith('auth_') || name.startsWith('session_')) return 'auth'
  if (name.startsWith('listing_')) return 'listing'
  if (name.startsWith('search_')) return 'search'
  if (name.startsWith('favorite')) return 'favorite'
  if (name.startsWith('page_') || name.startsWith('link_') || name.startsWith('cta_')) return 'navigation'
  if (name.startsWith('error_')) return 'error'
  return 'engagement'
}

/**
 * Flush event queue
 */
export function flush(): TrackedEvent[] {
  if (eventQueue.length === 0) return []
  
  const events = [...eventQueue]
  eventQueue.length = 0
  
  // Here you would send to analytics service
  // For now, just log
  if (config.debug) {
    logger.debug('Analytics', `Flushed ${events.length} events`)
  }
  
  return events
}

/**
 * Get queued events (for testing/debugging)
 */
export function getQueuedEvents(): TrackedEvent[] {
  return [...eventQueue]
}

/**
 * Set user ID for all future events
 */
export function setUserId(userId: string): void {
  // Would be used for analytics service
  logger.debug('Analytics', `User ID set: ${userId}`)
}

/**
 * Reset analytics (for logout)
 */
export function resetAnalytics(): void {
  sessionId = null
  eventQueue.length = 0
}

export default {
  track,
  trackPageView,
  trackListingView,
  trackSearch,
  trackFavorite,
  trackError,
  trackAuth,
  flush,
  getQueuedEvents,
  setUserId,
  resetAnalytics,
}
