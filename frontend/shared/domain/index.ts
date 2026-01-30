/**
 * LOCUS Domain Models
 * 
 * ARCHITECTURE LOCK (Patch 3) + Product Features (Patch 5)
 * All domain models exported from here.
 * UI components MUST use these types, NOT raw API types.
 * 
 * PATCH 5:
 * - Flows (auth, listing, favorites, owner)
 * - Favorites domain model
 * - Listing Policy
 */

// Listing
export type {
  MediaStorage,
  ListingMedia,
  ListingStatus,
  ListingType,
  ListingIntelligence,
  Listing,
  ListingCard,
  ListingDetail,
} from './listing.model'

export { isListingMedia, isListing } from './listing.model'

// User
export type {
  UserRole,
  AuthProvider,
  User,
  AuthStatus,
  AuthSession,
} from './user.model'

export { isUser, hasRole, hasAnyRole } from './user.model'

// Favorite (PATCH 5)
export type {
  Favorite,
  FavoriteWithListing,
  FavoritesSummary,
} from './favorite.model'
export {
  hasFavoriteListing,
  createEmptyFavoritesSummary,
  calculateFavoritesSummary,
} from './favorite.model'

// Listing Policy (PATCH 5)
export type { PermissionResult } from './listing.policy'
export { ListingPolicy } from './listing.policy'

// User Profile (PATCH 6)
export type {
  UserIntent,
  UserBehavior,
  UserSignals,
  UserProfile,
  ProfileUpdateEvent,
} from './userProfile.model'
export {
  createEmptyProfile,
  hasEnoughData,
  getProfileMaturity,
  isUserProfile,
} from './userProfile.model'

// Ranking (PATCH 6)
export type {
  RankingFactors,
  RankingReason,
  ListingRank,
  RankingConfig,
  RankingResult,
} from './ranking.model'
export {
  DEFAULT_RANKING_CONFIG,
  createEmptyFactors,
  calculateTotalScore,
  getTopReasons,
  getBoostLabels,
} from './ranking.model'

// Payment Intent (PATCH 6)
export type {
  PaymentIntentType,
  PaymentIntentStatus,
  PaymentMethod,
  PaymentIntent,
  PricingTier,
} from './paymentIntent.model'
export {
  DEFAULT_PRICING,
  createPaymentIntent,
  isPaymentIntentActive,
  formatPrice,
  getTierById,
  getTiersByType,
  isPaymentIntent,
} from './paymentIntent.model'

// Flows (PATCH 5 + 6)
export * from './flows'

// Decisions (PATCH 7)
export * from './decisions'

// Market (PATCH 7)
export * from './market'

// Behavior (PATCH 7)
export * from './behavior'

// Strategy (PATCH 7)
export * from './strategy'
