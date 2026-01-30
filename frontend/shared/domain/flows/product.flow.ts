/**
 * LOCUS Product Flow
 * 
 * PATCH 6: Smart Product Engine
 * 
 * Connects user profile to product state.
 * UI can only ask for state, not calculate it.
 */

import type { UserProfile } from '../userProfile.model'
import type { User } from '../user.model'

/**
 * Product engagement states
 */
export type ProductState =
  | 'anonymous'        // Not logged in, no activity
  | 'browsing'         // Logged in or has some views, passive
  | 'exploring'        // Actively viewing listings
  | 'interested'       // Has favorites or repeated views
  | 'engaged'          // High activity, potential conversion
  | 'ready_to_contact' // Very likely to contact

/**
 * Product state context
 */
export interface ProductStateContext {
  state: ProductState
  confidence: number
  nextState: ProductState | null
  triggers: ProductTrigger[]
  recommendations: ProductRecommendation[]
}

/**
 * Triggers that can move user to next state
 */
export type ProductTrigger =
  | { type: 'view_listing'; threshold: number }
  | { type: 'add_favorite'; threshold: number }
  | { type: 'contact_owner' }
  | { type: 'complete_profile' }
  | { type: 'return_visit' }
  | { type: 'time_on_site'; threshold: number }

/**
 * Product recommendations based on state
 */
export interface ProductRecommendation {
  id: string
  priority: number
  type: 'cta' | 'nudge' | 'feature' | 'content'
  message: string
  action?: string
}

// ==========================================
// STATE RESOLUTION
// ==========================================

/**
 * Resolve product state from user profile
 */
export function resolveProductState(
  profile: UserProfile | null,
  user: User | null
): ProductState {
  // Anonymous - no user, no meaningful activity
  if (!user && (!profile || profile.behavior.viewedListings.length < 2)) {
    return 'anonymous'
  }

  // No profile data - browsing
  if (!profile) {
    return 'browsing'
  }

  const {
    viewedListings,
    favoriteListings,
    contactedListings,
    sessionCount,
  } = profile.behavior

  const { engagementLevel, conversionProbability } = profile.signals

  // Ready to contact - has contacted before or very high probability
  if (contactedListings.length > 0 || conversionProbability > 0.7) {
    return 'ready_to_contact'
  }

  // Engaged - hot engagement, multiple favorites
  if (engagementLevel === 'hot' || favoriteListings.length >= 3) {
    return 'engaged'
  }

  // Interested - has favorites or warm engagement
  if (favoriteListings.length > 0 || engagementLevel === 'warm') {
    return 'interested'
  }

  // Exploring - actively viewing
  if (viewedListings.length >= 3 || sessionCount >= 2) {
    return 'exploring'
  }

  // Default - browsing
  return 'browsing'
}

/**
 * Get full product state context
 */
export function getProductStateContext(
  profile: UserProfile | null,
  user: User | null
): ProductStateContext {
  const state = resolveProductState(profile, user)
  const triggers = getTriggersForState(state, profile)
  const nextState = getNextState(state)
  const recommendations = getRecommendationsForState(state, profile)
  
  // Calculate confidence based on data quality
  const confidence = profile 
    ? Math.min(0.95, profile.intent.confidence + 0.3)
    : 0.3

  return {
    state,
    confidence,
    nextState,
    triggers,
    recommendations,
  }
}

/**
 * Get next logical state
 */
function getNextState(current: ProductState): ProductState | null {
  const progression: Record<ProductState, ProductState | null> = {
    anonymous: 'browsing',
    browsing: 'exploring',
    exploring: 'interested',
    interested: 'engaged',
    engaged: 'ready_to_contact',
    ready_to_contact: null, // Terminal state
  }
  
  return progression[current]
}

/**
 * Get triggers that can move user to next state
 */
function getTriggersForState(
  state: ProductState,
  profile: UserProfile | null
): ProductTrigger[] {
  const triggers: ProductTrigger[] = []
  
  switch (state) {
    case 'anonymous':
      triggers.push({ type: 'view_listing', threshold: 2 })
      break
      
    case 'browsing':
      triggers.push({ type: 'view_listing', threshold: 3 })
      triggers.push({ type: 'return_visit' })
      break
      
    case 'exploring':
      triggers.push({ type: 'add_favorite', threshold: 1 })
      triggers.push({ type: 'time_on_site', threshold: 300 }) // 5 min
      break
      
    case 'interested':
      triggers.push({ type: 'add_favorite', threshold: 3 })
      triggers.push({ type: 'view_listing', threshold: 10 })
      break
      
    case 'engaged':
      triggers.push({ type: 'contact_owner' })
      triggers.push({ type: 'complete_profile' })
      break
  }
  
  return triggers
}

/**
 * Get recommendations for current state
 */
function getRecommendationsForState(
  state: ProductState,
  profile: UserProfile | null
): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = []
  
  switch (state) {
    case 'anonymous':
      recommendations.push({
        id: 'signup_prompt',
        priority: 1,
        type: 'cta',
        message: 'Создайте аккаунт, чтобы сохранять избранное',
        action: '/auth/register',
      })
      break
      
    case 'browsing':
      recommendations.push({
        id: 'explore_listings',
        priority: 1,
        type: 'content',
        message: 'Посмотрите популярные объявления',
        action: '/listings?sort=popular',
      })
      break
      
    case 'exploring':
      recommendations.push({
        id: 'add_favorite',
        priority: 1,
        type: 'nudge',
        message: 'Добавьте понравившееся в избранное',
      })
      if (profile?.intent.city) {
        recommendations.push({
          id: 'city_filter',
          priority: 2,
          type: 'feature',
          message: `Смотрите объявления в ${profile.intent.city}`,
          action: `/listings?city=${profile.intent.city}`,
        })
      }
      break
      
    case 'interested':
      recommendations.push({
        id: 'compare_favorites',
        priority: 1,
        type: 'feature',
        message: 'Сравните избранные объявления',
        action: '/favorites',
      })
      break
      
    case 'engaged':
      recommendations.push({
        id: 'contact_cta',
        priority: 1,
        type: 'cta',
        message: 'Свяжитесь с владельцем',
      })
      break
      
    case 'ready_to_contact':
      recommendations.push({
        id: 'book_viewing',
        priority: 1,
        type: 'cta',
        message: 'Запишитесь на просмотр',
      })
      break
  }
  
  return recommendations.sort((a, b) => a.priority - b.priority)
}

// ==========================================
// UI HELPERS (read-only queries)
// ==========================================

/**
 * Check if should show CTA
 */
export function shouldShowCTA(context: ProductStateContext): boolean {
  return context.state === 'engaged' || context.state === 'ready_to_contact'
}

/**
 * Check if should show signup prompt
 */
export function shouldShowSignupPrompt(context: ProductStateContext): boolean {
  return context.state === 'anonymous' || context.state === 'browsing'
}

/**
 * Check if should show personalized content
 */
export function shouldShowPersonalized(context: ProductStateContext): boolean {
  return context.state !== 'anonymous' && context.confidence > 0.4
}

/**
 * Get CTA text based on state
 */
export function getCTAText(state: ProductState): string {
  switch (state) {
    case 'anonymous': return 'Начать поиск'
    case 'browsing': return 'Найти квартиру'
    case 'exploring': return 'Добавить в избранное'
    case 'interested': return 'Посмотреть избранное'
    case 'engaged': return 'Связаться с владельцем'
    case 'ready_to_contact': return 'Записаться на просмотр'
    default: return 'Продолжить'
  }
}

/**
 * Get progress percentage (0-100)
 */
export function getProgressPercentage(state: ProductState): number {
  const stateOrder: ProductState[] = [
    'anonymous',
    'browsing', 
    'exploring',
    'interested',
    'engaged',
    'ready_to_contact',
  ]
  
  const index = stateOrder.indexOf(state)
  return Math.round((index / (stateOrder.length - 1)) * 100)
}

/**
 * Product Flow Service namespace
 */
export const ProductFlow = {
  resolveProductState,
  getProductStateContext,
  shouldShowCTA,
  shouldShowSignupPrompt,
  shouldShowPersonalized,
  getCTAText,
  getProgressPercentage,
}

export default ProductFlow
