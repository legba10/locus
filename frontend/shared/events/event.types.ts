/**
 * LOCUS Event Types
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Unified event types for all sources.
 */

/**
 * Event source
 */
export type RawEventSource =
  | 'ui'
  | 'telegram'
  | 'ai'
  | 'payment'
  | 'system'
  | 'webhook'

/**
 * Raw event (from any source)
 */
export interface RawEvent {
  source: RawEventSource
  type: string
  data?: Record<string, unknown>
  timestamp?: number
}

/**
 * Normalized event (processed)
 */
export interface NormalizedEvent {
  id: string
  name: string
  source: RawEventSource
  timestamp: number
  
  // User context
  userId?: string
  sessionId?: string
  
  // Data
  data: Record<string, unknown>
  
  // Metadata
  metadata: {
    version: number
    processedAt: number
    originalType: string
  }
}

/**
 * Event handler
 */
export type EventHandler = (event: NormalizedEvent) => void | Promise<void>

/**
 * Event subscription
 */
export interface EventSubscription {
  id: string
  pattern: string | RegExp
  handler: EventHandler
  source?: RawEventSource
}

/**
 * Common event names
 */
export type CommonEventName =
  // User events
  | 'user_login'
  | 'user_logout'
  | 'user_register'
  
  // Listing events
  | 'listing_view'
  | 'listing_create'
  | 'listing_update'
  | 'listing_delete'
  | 'listing_publish'
  
  // Favorite events
  | 'favorite_add'
  | 'favorite_remove'
  
  // Search events
  | 'search_execute'
  | 'search_results'
  
  // Contact events
  | 'contact_view'
  | 'contact_call'
  | 'contact_message'
  
  // Payment events
  | 'payment_start'
  | 'payment_complete'
  | 'payment_fail'
  | 'subscription_start'
  | 'subscription_cancel'
  
  // Telegram events
  | 'telegram_message'
  | 'telegram_command'
  | 'telegram_callback'
  
  // AI events
  | 'ai_request'
  | 'ai_response'
  
  // System events
  | 'system_error'
  | 'system_health'
