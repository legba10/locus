/**
 * LOCUS User Profile Domain Model
 * 
 * PATCH 6: Smart Product Engine
 * 
 * User profile is built automatically from behavior.
 * ❌ UI cannot calculate profile directly
 * ✅ Only through UserIntelligenceService
 */

/**
 * User intent (what they want)
 */
export interface UserIntent {
  /** Looking to rent */
  rent?: boolean
  /** Looking to buy */
  buy?: boolean
  /** Preferred city */
  city?: string
  /** Preferred districts */
  districts?: string[]
  /** Budget range */
  budgetMin?: number
  budgetMax?: number
  /** Preferred rooms count */
  rooms?: number[]
  /** Preferred area range */
  areaMin?: number
  areaMax?: number
  /** Move-in urgency (days) */
  urgency?: number
  /** Confidence in intent (0-1) */
  confidence: number
}

/**
 * User behavior (what they did)
 */
export interface UserBehavior {
  /** Viewed listing IDs */
  viewedListings: string[]
  /** Favorited listing IDs */
  favoriteListings: string[]
  /** Contacted listing IDs */
  contactedListings: string[]
  /** Last search query */
  lastSearch?: string
  /** Last search filters */
  lastFilters?: Record<string, unknown>
  /** Session count */
  sessionCount: number
  /** Total time spent (seconds) */
  totalTimeSpent: number
  /** Last active timestamp */
  lastActiveAt: string
}

/**
 * User signals (derived metrics)
 */
export interface UserSignals {
  /** Overall activity score (0-100) */
  activityScore: number
  /** Price sensitivity (0-1, higher = more sensitive) */
  priceSensitivity: number
  /** Location affinity by city/district */
  locationAffinity: Record<string, number>
  /** Property type preferences */
  typePreference: Record<string, number>
  /** Engagement level */
  engagementLevel: 'cold' | 'warm' | 'hot'
  /** Likelihood to convert (0-1) */
  conversionProbability: number
}

/**
 * Complete User Profile
 */
export interface UserProfile {
  userId: string
  
  /** What user wants */
  intent: UserIntent
  
  /** What user did */
  behavior: UserBehavior
  
  /** Derived signals */
  signals: UserSignals
  
  /** Profile version for migrations */
  version: number
  
  /** Created timestamp */
  createdAt: string
  
  /** Last update timestamp */
  updatedAt: string
}

/**
 * Profile update event
 */
export type ProfileUpdateEvent =
  | { type: 'listing_view'; listingId: string; listing?: { price?: number; city?: string; rooms?: number } }
  | { type: 'favorite_add'; listingId: string }
  | { type: 'favorite_remove'; listingId: string }
  | { type: 'search'; query?: string; filters?: Record<string, unknown> }
  | { type: 'contact'; listingId: string }
  | { type: 'session_start' }
  | { type: 'session_end'; duration: number }
  | { type: 'time_on_listing'; listingId: string; duration: number }

/**
 * Create empty user profile
 */
export function createEmptyProfile(userId: string): UserProfile {
  const now = new Date().toISOString()
  
  return {
    userId,
    intent: {
      confidence: 0,
    },
    behavior: {
      viewedListings: [],
      favoriteListings: [],
      contactedListings: [],
      sessionCount: 0,
      totalTimeSpent: 0,
      lastActiveAt: now,
    },
    signals: {
      activityScore: 0,
      priceSensitivity: 0.5,
      locationAffinity: {},
      typePreference: {},
      engagementLevel: 'cold',
      conversionProbability: 0,
    },
    version: 1,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Check if profile has enough data for personalization
 */
export function hasEnoughData(profile: UserProfile): boolean {
  return (
    profile.behavior.viewedListings.length >= 3 ||
    profile.behavior.favoriteListings.length >= 1 ||
    profile.intent.confidence >= 0.3
  )
}

/**
 * Get profile maturity level
 */
export function getProfileMaturity(profile: UserProfile): 'new' | 'developing' | 'mature' {
  const viewCount = profile.behavior.viewedListings.length
  const favCount = profile.behavior.favoriteListings.length
  const sessionCount = profile.behavior.sessionCount
  
  if (viewCount >= 10 && favCount >= 3 && sessionCount >= 3) {
    return 'mature'
  }
  if (viewCount >= 3 || favCount >= 1 || sessionCount >= 2) {
    return 'developing'
  }
  return 'new'
}

/**
 * Type guard
 */
export function isUserProfile(obj: unknown): obj is UserProfile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as UserProfile).userId === 'string' &&
    typeof (obj as UserProfile).intent === 'object' &&
    typeof (obj as UserProfile).behavior === 'object' &&
    typeof (obj as UserProfile).signals === 'object'
  )
}
