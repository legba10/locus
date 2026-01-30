/**
 * LOCUS Behavior Policy
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * Controls user behavior through policies.
 * LOCUS starts to manage user actions.
 */

import type { UserProfile } from '../userProfile.model'
import type { User } from '../user.model'
import type { ListingCard, Listing } from '../listing.model'
import type { ProductState } from '../flows/product.flow'

/**
 * Policy decision
 */
export interface PolicyDecision {
  allowed: boolean
  reason?: string
  alternative?: string
  upgradeRequired?: boolean
  cooldownSeconds?: number
}

/**
 * Limit configuration
 */
export interface LimitConfig {
  /** Max contacts per day for free users */
  freeContactsPerDay: number
  /** Max favorites for free users */
  freeFavoritesLimit: number
  /** Max search results for anonymous */
  anonymousSearchLimit: number
  /** Cooldown between contacts (seconds) */
  contactCooldown: number
}

const DEFAULT_LIMITS: LimitConfig = {
  freeContactsPerDay: 5,
  freeFavoritesLimit: 20,
  anonymousSearchLimit: 10,
  contactCooldown: 60, // 1 minute
}

// ==========================================
// CONTACT POLICIES
// ==========================================

/**
 * Check if user should have limited contacts
 */
export function shouldLimitContacts(
  user: User | null,
  profile: UserProfile | null,
  listing: ListingCard | Listing,
  limits: LimitConfig = DEFAULT_LIMITS
): PolicyDecision {
  // No user = must login
  if (!user) {
    return {
      allowed: false,
      reason: 'Войдите, чтобы связаться с владельцем',
      alternative: 'show_login',
    }
  }

  // Premium users have no limits
  if (user.roles.includes('admin')) {
    return { allowed: true }
  }

  // Check daily limit
  const contactsToday = profile?.behavior.contactedListings.length || 0
  if (contactsToday >= limits.freeContactsPerDay) {
    return {
      allowed: false,
      reason: `Достигнут лимит контактов (${limits.freeContactsPerDay} в день)`,
      alternative: 'Получите Premium для безлимитных контактов',
      upgradeRequired: true,
    }
  }

  // Check cooldown (would need timestamp tracking)
  // For now, always allow if under limit

  return { allowed: true }
}

/**
 * Check if contact requires payment
 */
export function shouldRequirePayment(
  user: User | null,
  profile: UserProfile | null,
  monetizationLevel: 'none' | 'soft' | 'moderate' | 'aggressive'
): PolicyDecision {
  if (monetizationLevel === 'none') {
    return { allowed: true }
  }

  if (!user) {
    return {
      allowed: false,
      reason: 'Войдите для просмотра контактов',
      alternative: 'show_login',
    }
  }

  if (monetizationLevel === 'aggressive') {
    const contactsUsed = profile?.behavior.contactedListings.length || 0
    if (contactsUsed >= 2) {
      return {
        allowed: false,
        reason: 'Бесплатные контакты закончились',
        upgradeRequired: true,
      }
    }
  }

  return { allowed: true }
}

// ==========================================
// AUTH POLICIES
// ==========================================

/**
 * Check if should force auth
 */
export function shouldForceAuth(
  user: User | null,
  profile: UserProfile | null,
  productState: ProductState
): PolicyDecision {
  // Already authenticated
  if (user) {
    return { allowed: true }
  }

  // Force auth for engaged users
  if (productState === 'engaged' || productState === 'ready_to_contact') {
    return {
      allowed: false,
      reason: 'Войдите, чтобы продолжить',
      alternative: 'show_login',
    }
  }

  // Force auth after many views
  if (profile && profile.behavior.viewedListings.length >= 10) {
    return {
      allowed: false,
      reason: 'Создайте аккаунт для продолжения просмотра',
      alternative: 'show_signup',
    }
  }

  return { allowed: true }
}

/**
 * Check if should show registration wall
 */
export function shouldShowRegistrationWall(
  user: User | null,
  profile: UserProfile | null
): PolicyDecision {
  if (user) {
    return { allowed: false } // Already registered
  }

  // Show wall after significant activity
  const viewCount = profile?.behavior.viewedListings.length || 0
  const sessionCount = profile?.behavior.sessionCount || 0

  if (viewCount >= 5 || sessionCount >= 2) {
    return {
      allowed: true,
      reason: 'Создайте аккаунт для сохранения избранного',
    }
  }

  return { allowed: false }
}

// ==========================================
// OWNER POLICIES
// ==========================================

/**
 * Check if should push premium to owner
 */
export function shouldPushPremium(
  user: User | null,
  profile: UserProfile | null,
  listingsCount: number,
  monthlyViews: number
): PolicyDecision {
  if (!user) {
    return { allowed: false }
  }

  // Not an owner
  if (!user.roles.includes('landlord')) {
    return { allowed: false }
  }

  // Already premium
  if (user.roles.includes('admin')) {
    return { allowed: false }
  }

  // Push premium for active owners
  if (listingsCount >= 3) {
    return {
      allowed: true,
      reason: 'Управляйте объявлениями эффективнее с Premium',
    }
  }

  if (monthlyViews >= 100) {
    return {
      allowed: true,
      reason: 'Ваши объявления популярны! Premium даст больше возможностей',
    }
  }

  return { allowed: false }
}

/**
 * Check if should suggest listing boost
 */
export function shouldSuggestBoost(
  user: User | null,
  listing: ListingCard | Listing,
  daysOnMarket: number,
  competitionLevel: 'low' | 'medium' | 'high' | 'extreme'
): PolicyDecision {
  if (!user) {
    return { allowed: false }
  }

  // High competition
  if (competitionLevel === 'high' || competitionLevel === 'extreme') {
    return {
      allowed: true,
      reason: 'Высокая конкуренция. Поднимите объявление для большей видимости',
    }
  }

  // Long time on market
  if (daysOnMarket > 14) {
    return {
      allowed: true,
      reason: 'Объявление давно на рынке. Буст поможет найти арендатора',
    }
  }

  return { allowed: false }
}

// ==========================================
// FAVORITES POLICIES
// ==========================================

/**
 * Check favorites limit
 */
export function checkFavoritesLimit(
  user: User | null,
  profile: UserProfile | null,
  limits: LimitConfig = DEFAULT_LIMITS
): PolicyDecision {
  if (!user) {
    return {
      allowed: false,
      reason: 'Войдите, чтобы сохранять избранное',
      alternative: 'show_login',
    }
  }

  const currentFavorites = profile?.behavior.favoriteListings.length || 0
  
  // Check limit for free users
  if (currentFavorites >= limits.freeFavoritesLimit) {
    return {
      allowed: false,
      reason: `Достигнут лимит избранного (${limits.freeFavoritesLimit})`,
      upgradeRequired: true,
    }
  }

  return { allowed: true }
}

// ==========================================
// SEARCH POLICIES
// ==========================================

/**
 * Check search limit for anonymous users
 */
export function checkSearchLimit(
  user: User | null,
  searchesInSession: number,
  limits: LimitConfig = DEFAULT_LIMITS
): PolicyDecision {
  if (user) {
    return { allowed: true }
  }

  if (searchesInSession >= limits.anonymousSearchLimit) {
    return {
      allowed: false,
      reason: 'Создайте аккаунт для продолжения поиска',
      alternative: 'show_signup',
    }
  }

  return { allowed: true }
}

// ==========================================
// BEHAVIOR POLICY NAMESPACE
// ==========================================

export const BehaviorPolicy = {
  // Contact
  shouldLimitContacts,
  shouldRequirePayment,
  
  // Auth
  shouldForceAuth,
  shouldShowRegistrationWall,
  
  // Owner
  shouldPushPremium,
  shouldSuggestBoost,
  
  // Favorites
  checkFavoritesLimit,
  
  // Search
  checkSearchLimit,
}

export default BehaviorPolicy
