/**
 * LOCUS User Intelligence Service
 * 
 * PATCH 6: Smart Product Engine
 * 
 * Builds and updates user profiles from behavior.
 * ❌ UI cannot calculate profile directly
 * ✅ Only through this service
 */

import { logger } from '../utils/logger'
import type { ListingCard } from '../domain/listing.model'
import type { TrackedEvent } from '../analytics/events'
import {
  type UserProfile,
  type UserIntent,
  type UserBehavior,
  type UserSignals,
  type ProfileUpdateEvent,
  createEmptyProfile,
} from '../domain/userProfile.model'

// ==========================================
// CONSTANTS
// ==========================================

const MAX_VIEWED_HISTORY = 50
const MAX_FAVORITE_HISTORY = 100
const INTENT_CONFIDENCE_THRESHOLD = 0.6
const ENGAGEMENT_THRESHOLDS = {
  cold: 3,  // < 3 views
  warm: 10, // 3-10 views
  hot: 10,  // > 10 views
}

// ==========================================
// INTENT INFERENCE
// ==========================================

/**
 * Infer user intent from viewed listings
 */
function inferIntent(
  viewedListings: ListingCard[],
  behavior: UserBehavior
): UserIntent {
  if (viewedListings.length === 0) {
    return { confidence: 0 }
  }

  // Extract patterns from viewed listings
  const cities = viewedListings
    .map(l => l.city)
    .filter(Boolean)
  
  const prices = viewedListings
    .map(l => l.price)
    .filter(p => p > 0)
  
  const rooms = viewedListings
    .map(l => l.rooms)
    .filter((r): r is number => r !== undefined && r > 0)

  // Calculate mode (most common value)
  const cityMode = mode(cities)
  const roomsMode = mode(rooms.map(String))

  // Calculate price range (10th and 90th percentile)
  const sortedPrices = [...prices].sort((a, b) => a - b)
  const p10 = sortedPrices[Math.floor(sortedPrices.length * 0.1)] || 0
  const p90 = sortedPrices[Math.floor(sortedPrices.length * 0.9)] || 0

  // Calculate confidence based on data consistency
  const cityConfidence = cities.length > 0 
    ? cities.filter(c => c === cityMode).length / cities.length 
    : 0
  const priceSpread = p90 > 0 ? (p90 - p10) / p90 : 1
  const priceConfidence = 1 - priceSpread

  const confidence = Math.min(
    0.95,
    (cityConfidence * 0.4 + priceConfidence * 0.4 + Math.min(viewedListings.length / 10, 0.2))
  )

  return {
    rent: true, // Default assumption
    city: cityMode || undefined,
    budgetMin: p10 > 0 ? Math.floor(p10 * 0.9) : undefined,
    budgetMax: p90 > 0 ? Math.ceil(p90 * 1.1) : undefined,
    rooms: roomsMode ? [parseInt(roomsMode)] : undefined,
    confidence,
  }
}

// ==========================================
// SIGNALS CALCULATION
// ==========================================

/**
 * Calculate user signals from behavior
 */
function calculateSignals(
  behavior: UserBehavior,
  viewedListings: ListingCard[]
): UserSignals {
  // Activity score (0-100)
  const activityScore = Math.min(100,
    behavior.viewedListings.length * 5 +
    behavior.favoriteListings.length * 10 +
    behavior.contactedListings.length * 20 +
    behavior.sessionCount * 5
  )

  // Price sensitivity (based on price variance in favorites vs views)
  const viewedPrices = viewedListings.map(l => l.price).filter(p => p > 0)
  const avgPrice = viewedPrices.length > 0 
    ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length 
    : 0
  const priceVariance = viewedPrices.length > 0
    ? viewedPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / viewedPrices.length
    : 0
  const priceSensitivity = Math.min(1, Math.sqrt(priceVariance) / (avgPrice || 1))

  // Location affinity
  const locationAffinity: Record<string, number> = {}
  viewedListings.forEach(l => {
    if (l.city) {
      locationAffinity[l.city] = (locationAffinity[l.city] || 0) + 1
    }
    if (l.district) {
      const key = `${l.city}:${l.district}`
      locationAffinity[key] = (locationAffinity[key] || 0) + 2
    }
  })
  // Normalize to 0-1
  const maxAffinity = Math.max(...Object.values(locationAffinity), 1)
  for (const key in locationAffinity) {
    locationAffinity[key] /= maxAffinity
  }

  // Type preference
  const typePreference: Record<string, number> = {}
  viewedListings.forEach(l => {
    const type = l.rooms === 1 ? 'studio' : `${l.rooms || 2}room`
    typePreference[type] = (typePreference[type] || 0) + 1
  })

  // Engagement level
  const viewCount = behavior.viewedListings.length
  const engagementLevel: UserSignals['engagementLevel'] = 
    viewCount > ENGAGEMENT_THRESHOLDS.hot ? 'hot' :
    viewCount >= ENGAGEMENT_THRESHOLDS.cold ? 'warm' : 'cold'

  // Conversion probability
  const conversionProbability = Math.min(0.95,
    (behavior.contactedListings.length > 0 ? 0.5 : 0) +
    (behavior.favoriteListings.length * 0.05) +
    (engagementLevel === 'hot' ? 0.2 : engagementLevel === 'warm' ? 0.1 : 0)
  )

  return {
    activityScore,
    priceSensitivity,
    locationAffinity,
    typePreference,
    engagementLevel,
    conversionProbability,
  }
}

// ==========================================
// PROFILE UPDATES
// ==========================================

/**
 * Update behavior from event
 */
function updateBehavior(
  behavior: UserBehavior,
  event: ProfileUpdateEvent
): UserBehavior {
  const now = new Date().toISOString()
  const updated = { ...behavior, lastActiveAt: now }

  switch (event.type) {
    case 'listing_view':
      if (!updated.viewedListings.includes(event.listingId)) {
        updated.viewedListings = [
          event.listingId,
          ...updated.viewedListings.slice(0, MAX_VIEWED_HISTORY - 1)
        ]
      }
      break

    case 'favorite_add':
      if (!updated.favoriteListings.includes(event.listingId)) {
        updated.favoriteListings = [
          event.listingId,
          ...updated.favoriteListings.slice(0, MAX_FAVORITE_HISTORY - 1)
        ]
      }
      break

    case 'favorite_remove':
      updated.favoriteListings = updated.favoriteListings.filter(
        id => id !== event.listingId
      )
      break

    case 'search':
      updated.lastSearch = event.query
      updated.lastFilters = event.filters
      break

    case 'contact':
      if (!updated.contactedListings.includes(event.listingId)) {
        updated.contactedListings = [...updated.contactedListings, event.listingId]
      }
      break

    case 'session_start':
      updated.sessionCount += 1
      break

    case 'session_end':
      updated.totalTimeSpent += event.duration
      break
  }

  return updated
}

// ==========================================
// PUBLIC API
// ==========================================

/**
 * Build complete profile from listings and events
 */
export function buildProfile(
  userId: string,
  viewedListings: ListingCard[],
  events: ProfileUpdateEvent[] = []
): UserProfile {
  logger.debug('UserIntelligence', 'Building profile', { userId, viewedCount: viewedListings.length })

  // Start with empty profile
  let profile = createEmptyProfile(userId)

  // Apply all events to behavior
  for (const event of events) {
    profile.behavior = updateBehavior(profile.behavior, event)
  }

  // Add viewed listings to behavior
  for (const listing of viewedListings) {
    if (!profile.behavior.viewedListings.includes(listing.id)) {
      profile.behavior.viewedListings.push(listing.id)
    }
  }

  // Infer intent
  profile.intent = inferIntent(viewedListings, profile.behavior)

  // Calculate signals
  profile.signals = calculateSignals(profile.behavior, viewedListings)

  profile.updatedAt = new Date().toISOString()

  return profile
}

/**
 * Update existing profile with new event
 */
export function updateProfile(
  profile: UserProfile,
  event: ProfileUpdateEvent,
  listing?: ListingCard
): UserProfile {
  logger.debug('UserIntelligence', 'Updating profile', { userId: profile.userId, event: event.type })

  const updatedBehavior = updateBehavior(profile.behavior, event)

  // If we have the listing data, update signals more accurately
  const viewedListings: ListingCard[] = listing ? [listing] : []

  // Recalculate signals incrementally
  const updatedSignals = calculateSignals(updatedBehavior, viewedListings)

  // Merge with existing signals
  const mergedSignals: UserSignals = {
    ...profile.signals,
    activityScore: Math.max(profile.signals.activityScore, updatedSignals.activityScore),
    engagementLevel: updatedSignals.engagementLevel,
    conversionProbability: Math.max(
      profile.signals.conversionProbability,
      updatedSignals.conversionProbability
    ),
  }

  // Merge location affinity
  for (const [loc, score] of Object.entries(updatedSignals.locationAffinity)) {
    mergedSignals.locationAffinity[loc] = Math.max(
      mergedSignals.locationAffinity[loc] || 0,
      score
    )
  }

  // Update intent if we have new listing data
  let updatedIntent = profile.intent
  if (listing && event.type === 'listing_view') {
    // Incrementally update intent
    if (listing.city && !updatedIntent.city) {
      updatedIntent = { ...updatedIntent, city: listing.city }
    }
    if (listing.price && updatedIntent.budgetMax === undefined) {
      updatedIntent = {
        ...updatedIntent,
        budgetMin: Math.floor(listing.price * 0.7),
        budgetMax: Math.ceil(listing.price * 1.3),
      }
    }
    updatedIntent.confidence = Math.min(
      0.95,
      updatedIntent.confidence + 0.05
    )
  }

  return {
    ...profile,
    behavior: updatedBehavior,
    signals: mergedSignals,
    intent: updatedIntent,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Merge analytics events into profile update events
 */
export function convertAnalyticsEvents(events: TrackedEvent[]): ProfileUpdateEvent[] {
  return events
    .filter(e => 
      e.name === 'listing_view' ||
      e.name === 'favorite_add' ||
      e.name === 'favorite_remove' ||
      e.name === 'search_results' ||
      e.name === 'listing_contact'
    )
    .map(e => {
      switch (e.name) {
        case 'listing_view':
          return { 
            type: 'listing_view' as const, 
            listingId: e.properties.listingId as string 
          }
        case 'favorite_add':
          return { 
            type: 'favorite_add' as const, 
            listingId: e.properties.listingId as string 
          }
        case 'favorite_remove':
          return { 
            type: 'favorite_remove' as const, 
            listingId: e.properties.listingId as string 
          }
        case 'search_results':
          return { 
            type: 'search' as const, 
            query: e.properties.searchQuery as string,
            filters: e.properties.searchFilters as Record<string, unknown>
          }
        case 'listing_contact':
          return { 
            type: 'contact' as const, 
            listingId: e.properties.listingId as string 
          }
        default:
          return null
      }
    })
    .filter((e): e is ProfileUpdateEvent => e !== null)
}

/**
 * Get profile summary for debugging
 */
export function getProfileSummary(profile: UserProfile): string {
  return [
    `User: ${profile.userId}`,
    `Views: ${profile.behavior.viewedListings.length}`,
    `Favorites: ${profile.behavior.favoriteListings.length}`,
    `Engagement: ${profile.signals.engagementLevel}`,
    `Intent confidence: ${(profile.intent.confidence * 100).toFixed(0)}%`,
    `Conversion prob: ${(profile.signals.conversionProbability * 100).toFixed(0)}%`,
  ].join(' | ')
}

// ==========================================
// HELPERS
// ==========================================

function mode<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  
  const counts = new Map<T, number>()
  let maxCount = 0
  let maxItem: T = arr[0]
  
  for (const item of arr) {
    const count = (counts.get(item) || 0) + 1
    counts.set(item, count)
    if (count > maxCount) {
      maxCount = count
      maxItem = item
    }
  }
  
  return maxItem
}

/**
 * User Intelligence Service namespace
 */
export const UserIntelligenceService = {
  buildProfile,
  updateProfile,
  convertAnalyticsEvents,
  getProfileSummary,
}

export default UserIntelligenceService
