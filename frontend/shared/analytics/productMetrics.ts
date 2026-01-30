/**
 * LOCUS Product Metrics
 * 
 * PATCH 6: Smart Product Engine
 * 
 * High-level business metrics built on top of events.
 * Not just tracking, but understanding.
 */

import { logger } from '../utils/logger'
import type { TrackedEvent } from './events'
import type { UserProfile } from '../domain/userProfile.model'
import type { ListingCard } from '../domain/listing.model'

// ==========================================
// METRIC TYPES
// ==========================================

/**
 * Conversion funnel stages
 */
export type FunnelStage =
  | 'visit'
  | 'view_listing'
  | 'add_favorite'
  | 'contact'
  | 'convert'

/**
 * Time period for metrics
 */
export type MetricPeriod = 'hour' | 'day' | 'week' | 'month' | 'all'

/**
 * Metric snapshot
 */
export interface MetricSnapshot {
  value: number
  change: number // vs previous period (%)
  trend: 'up' | 'down' | 'stable'
  period: MetricPeriod
  timestamp: string
}

/**
 * Funnel metrics
 */
export interface FunnelMetrics {
  stages: Record<FunnelStage, number>
  conversionRates: Record<string, number>
  dropoffStage: FunnelStage | null
  totalConversions: number
}

/**
 * Listing metrics
 */
export interface ListingMetrics {
  listingId: string
  views: number
  uniqueViews: number
  favorites: number
  contacts: number
  ctr: number // Click-through rate (views / impressions)
  favoriteRate: number // favorites / views
  contactRate: number // contacts / views
  avgTimeOnListing: number // seconds
  score: number // Overall performance score
}

/**
 * User metrics
 */
export interface UserMetrics {
  userId: string
  totalSessions: number
  totalViews: number
  totalFavorites: number
  totalContacts: number
  engagementScore: number
  retentionDays: number
  lifetimeValue: number
}

// ==========================================
// METRIC CALCULATIONS
// ==========================================

/**
 * Calculate conversion rate between stages
 */
export function calculateConversionRate(
  fromCount: number,
  toCount: number
): number {
  if (fromCount === 0) return 0
  return Math.round((toCount / fromCount) * 10000) / 100 // 2 decimal places
}

/**
 * Calculate funnel metrics from events
 */
export function calculateFunnelMetrics(events: TrackedEvent[]): FunnelMetrics {
  const stages: Record<FunnelStage, Set<string>> = {
    visit: new Set(),
    view_listing: new Set(),
    add_favorite: new Set(),
    contact: new Set(),
    convert: new Set(),
  }

  // Count unique sessions/users per stage
  for (const event of events) {
    const sessionId = event.properties.sessionId as string || 'unknown'
    
    switch (event.name) {
      case 'page_view':
        stages.visit.add(sessionId)
        break
      case 'listing_view':
        stages.view_listing.add(sessionId)
        break
      case 'favorite_add':
        stages.add_favorite.add(sessionId)
        break
      case 'listing_contact':
        stages.contact.add(sessionId)
        break
      // Add convert tracking when payments are implemented
    }
  }

  const stageCounts: Record<FunnelStage, number> = {
    visit: stages.visit.size,
    view_listing: stages.view_listing.size,
    add_favorite: stages.add_favorite.size,
    contact: stages.contact.size,
    convert: stages.convert.size,
  }

  // Calculate conversion rates
  const conversionRates: Record<string, number> = {
    'visit_to_view': calculateConversionRate(stageCounts.visit, stageCounts.view_listing),
    'view_to_favorite': calculateConversionRate(stageCounts.view_listing, stageCounts.add_favorite),
    'favorite_to_contact': calculateConversionRate(stageCounts.add_favorite, stageCounts.contact),
    'contact_to_convert': calculateConversionRate(stageCounts.contact, stageCounts.convert),
    'overall': calculateConversionRate(stageCounts.visit, stageCounts.contact),
  }

  // Find biggest dropoff
  let dropoffStage: FunnelStage | null = null
  let maxDropoff = 0
  const stageOrder: FunnelStage[] = ['visit', 'view_listing', 'add_favorite', 'contact', 'convert']
  
  for (let i = 0; i < stageOrder.length - 1; i++) {
    const current = stageCounts[stageOrder[i]]
    const next = stageCounts[stageOrder[i + 1]]
    const dropoff = current > 0 ? (current - next) / current : 0
    
    if (dropoff > maxDropoff) {
      maxDropoff = dropoff
      dropoffStage = stageOrder[i]
    }
  }

  return {
    stages: stageCounts,
    conversionRates,
    dropoffStage,
    totalConversions: stageCounts.convert,
  }
}

/**
 * Calculate listing metrics
 */
export function calculateListingMetrics(
  listingId: string,
  events: TrackedEvent[],
  impressions: number = 0
): ListingMetrics {
  const listingEvents = events.filter(
    e => e.properties.listingId === listingId
  )

  const views = listingEvents.filter(e => e.name === 'listing_view').length
  const uniqueViewers = new Set(
    listingEvents
      .filter(e => e.name === 'listing_view')
      .map(e => e.properties.sessionId)
  ).size
  const favorites = listingEvents.filter(e => e.name === 'favorite_add').length
  const contacts = listingEvents.filter(e => e.name === 'listing_contact').length

  // Calculate time on listing
  const timeEvents = listingEvents.filter(e => e.name === 'time_on_page')
  const avgTime = timeEvents.length > 0
    ? timeEvents.reduce((sum, e) => sum + ((e.properties.duration as number) || 0), 0) / timeEvents.length
    : 0

  // Calculate rates
  const ctr = impressions > 0 ? calculateConversionRate(impressions, views) : 0
  const favoriteRate = calculateConversionRate(views, favorites)
  const contactRate = calculateConversionRate(views, contacts)

  // Calculate performance score (0-100)
  const score = Math.min(100, Math.round(
    (favoriteRate * 2) +
    (contactRate * 5) +
    (Math.min(avgTime / 60, 5) * 10) +
    (Math.min(uniqueViewers / 10, 20))
  ))

  return {
    listingId,
    views,
    uniqueViews: uniqueViewers,
    favorites,
    contacts,
    ctr,
    favoriteRate,
    contactRate,
    avgTimeOnListing: avgTime,
    score,
  }
}

/**
 * Calculate user metrics
 */
export function calculateUserMetrics(
  userId: string,
  events: TrackedEvent[],
  profile: UserProfile | null
): UserMetrics {
  const userEvents = events.filter(
    e => e.properties.userId === userId
  )

  const sessions = new Set(userEvents.map(e => e.properties.sessionId)).size
  const views = userEvents.filter(e => e.name === 'listing_view').length
  const favorites = profile?.behavior.favoriteListings.length || 0
  const contacts = profile?.behavior.contactedListings.length || 0

  // Engagement score from profile
  const engagementScore = profile?.signals.activityScore || 0

  // Calculate retention (days since first event)
  const timestamps = userEvents.map(e => new Date(e.timestamp).getTime())
  const retentionDays = timestamps.length > 1
    ? Math.floor((Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24))
    : 0

  // Placeholder for LTV (would need payment data)
  const lifetimeValue = contacts * 1000 // Rough estimate: 1000 RUB per contact

  return {
    userId,
    totalSessions: sessions,
    totalViews: views,
    totalFavorites: favorites,
    totalContacts: contacts,
    engagementScore,
    retentionDays,
    lifetimeValue,
  }
}

/**
 * Calculate engagement score from events
 */
export function calculateEngagementScore(events: TrackedEvent[]): number {
  let score = 0

  for (const event of events) {
    switch (event.name) {
      case 'page_view': score += 1; break
      case 'listing_view': score += 3; break
      case 'favorite_add': score += 10; break
      case 'favorite_remove': score -= 2; break
      case 'search_results': score += 2; break
      case 'listing_contact': score += 20; break
    }
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Get top performing listings
 */
export function getTopListings(
  events: TrackedEvent[],
  limit: number = 10
): ListingMetrics[] {
  // Get unique listing IDs
  const listingIds = new Set(
    events
      .filter(e => e.properties.listingId)
      .map(e => e.properties.listingId as string)
  )

  // Calculate metrics for each
  const metrics = Array.from(listingIds)
    .map(id => calculateListingMetrics(id, events))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return metrics
}

/**
 * Create metric snapshot
 */
export function createSnapshot(
  value: number,
  previousValue: number,
  period: MetricPeriod
): MetricSnapshot {
  const change = previousValue > 0 
    ? Math.round(((value - previousValue) / previousValue) * 100) 
    : 0
  
  return {
    value,
    change,
    trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
    period,
    timestamp: new Date().toISOString(),
  }
}

// ==========================================
// PRODUCT METRICS NAMESPACE
// ==========================================

export const ProductMetrics = {
  // Conversion
  conversionRate: calculateConversionRate,
  funnelMetrics: calculateFunnelMetrics,
  
  // Listing performance
  listingMetrics: calculateListingMetrics,
  topListings: getTopListings,
  
  // User metrics
  userMetrics: calculateUserMetrics,
  engagementScore: calculateEngagementScore,
  
  // Helpers
  createSnapshot,
}

export default ProductMetrics
