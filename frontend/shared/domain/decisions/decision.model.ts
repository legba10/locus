/**
 * LOCUS Decision Domain Model
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * ❌ UI cannot make decisions
 * ✅ Only through DecisionEngine
 */

import type { UserProfile } from '../userProfile.model'
import type { ListingRank } from '../ranking.model'
import type { ProductState } from '../flows/product.flow'

/**
 * Decision types
 */
export type DecisionType =
  // User acquisition
  | 'show_login'
  | 'show_signup'
  | 'force_auth'
  
  // Engagement
  | 'show_cta'
  | 'show_contact'
  | 'push_favorites'
  | 'show_similar'
  
  // Monetization
  | 'show_paywall'
  | 'offer_boost'
  | 'offer_premium'
  | 'promote_subscription'
  
  // Supply side (owners)
  | 'promote_owner'
  | 'encourage_listing'
  | 'suggest_price_drop'
  | 'boost_listing'
  
  // Visibility control
  | 'limit_visibility'
  | 'expand_reach'
  | 'personalize_feed'
  | 'diversify_feed'
  
  // Retention
  | 'send_notification'
  | 'email_reminder'
  | 'offer_discount'
  
  // No action
  | 'none'

/**
 * Decision priority levels
 */
export type DecisionPriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Decision urgency
 */
export type DecisionUrgency = 'immediate' | 'soon' | 'scheduled' | 'passive'

/**
 * Monetization aggression levels
 */
export type MonetizationLevel = 
  | 'none'      // Free experience
  | 'soft'      // Gentle suggestions
  | 'moderate'  // Clear upsells
  | 'aggressive' // Strong paywalls

/**
 * Decision context
 */
export interface DecisionContext {
  // User context
  profile: UserProfile | null
  productState: ProductState
  isAuthenticated: boolean
  isOwner: boolean
  
  // Listing context
  ranking?: ListingRank[]
  currentListingId?: string
  
  // Market context (from MarketService)
  marketPressure?: number
  competitionLevel?: 'low' | 'medium' | 'high'
  
  // Growth context (from GrowthService)
  churnRisk?: number
  conversionProbability?: number
  
  // Strategy context (from ProductStrategy)
  strategyMode?: 'growth' | 'monetization' | 'liquidity' | 'market_capture'
  monetizationLevel?: MonetizationLevel

  // AI context (read-only signals)
  aiSignals?: Record<string, unknown> | null
  
  // Time context
  timestamp: string
  dayOfWeek: number
  hourOfDay: number
}

/**
 * Single decision
 */
export interface Decision {
  type: DecisionType
  priority: DecisionPriority
  urgency: DecisionUrgency
  
  /** Confidence in this decision (0-1) */
  confidence: number
  
  /** Reason for decision (for logging/debugging) */
  reason: string
  
  /** Additional parameters */
  params?: Record<string, unknown>
  
  /** When this decision was made */
  madeAt: string
  
  /** Expires after (ISO timestamp) */
  expiresAt?: string
}

/**
 * Decision result (multiple decisions can be made)
 */
export interface DecisionResult {
  decisions: Decision[]
  primaryDecision: Decision | null
  context: DecisionContext
  processingTime: number
}

/**
 * Decision rule
 */
export interface DecisionRule {
  id: string
  name: string
  condition: (ctx: DecisionContext) => boolean
  decision: DecisionType
  priority: DecisionPriority
  urgency: DecisionUrgency
  confidence: number
  reason: string
  params?: (ctx: DecisionContext) => Record<string, unknown>
}

/**
 * Create empty decision context
 */
export function createDecisionContext(
  partial: Partial<DecisionContext>
): DecisionContext {
  const now = new Date()
  return {
    profile: null,
    productState: 'anonymous',
    isAuthenticated: false,
    isOwner: false,
    aiSignals: null,
    timestamp: now.toISOString(),
    dayOfWeek: now.getDay(),
    hourOfDay: now.getHours(),
    ...partial,
  }
}

/**
 * Create decision
 */
export function createDecision(
  type: DecisionType,
  rule: Omit<DecisionRule, 'id' | 'name' | 'condition'>,
  params?: Record<string, unknown>
): Decision {
  return {
    type,
    priority: rule.priority,
    urgency: rule.urgency,
    confidence: rule.confidence,
    reason: rule.reason,
    params,
    madeAt: new Date().toISOString(),
  }
}

/**
 * Get decision display info
 */
export function getDecisionDisplay(type: DecisionType): {
  title: string
  description: string
} {
  const displays: Record<DecisionType, { title: string; description: string }> = {
    show_login: { title: 'Показать вход', description: 'Предложить войти в аккаунт' },
    show_signup: { title: 'Показать регистрацию', description: 'Предложить создать аккаунт' },
    force_auth: { title: 'Требовать авторизацию', description: 'Заблокировать действие без входа' },
    show_cta: { title: 'Показать CTA', description: 'Показать призыв к действию' },
    show_contact: { title: 'Показать контакты', description: 'Показать способ связи' },
    push_favorites: { title: 'Предложить избранное', description: 'Напомнить о сохранении' },
    show_similar: { title: 'Показать похожие', description: 'Предложить альтернативы' },
    show_paywall: { title: 'Показать paywall', description: 'Ограничить доступ' },
    offer_boost: { title: 'Предложить буст', description: 'Предложить продвижение' },
    offer_premium: { title: 'Предложить Premium', description: 'Предложить платную подписку' },
    promote_subscription: { title: 'Продвигать подписку', description: 'Активно предлагать подписку' },
    promote_owner: { title: 'Привлечь владельца', description: 'Предложить стать арендодателем' },
    encourage_listing: { title: 'Стимулировать листинг', description: 'Предложить создать объявление' },
    suggest_price_drop: { title: 'Предложить снизить цену', description: 'Рекомендовать скидку' },
    boost_listing: { title: 'Поднять объявление', description: 'Автоматический буст' },
    limit_visibility: { title: 'Ограничить видимость', description: 'Уменьшить охват' },
    expand_reach: { title: 'Расширить охват', description: 'Увеличить видимость' },
    personalize_feed: { title: 'Персонализировать', description: 'Показать релевантное' },
    diversify_feed: { title: 'Разнообразить', description: 'Показать разные варианты' },
    send_notification: { title: 'Отправить уведомление', description: 'Push или in-app' },
    email_reminder: { title: 'Email напоминание', description: 'Отправить письмо' },
    offer_discount: { title: 'Предложить скидку', description: 'Специальное предложение' },
    none: { title: 'Нет действия', description: 'Ничего не делать' },
  }
  
  return displays[type] || { title: type, description: '' }
}

/**
 * Sort decisions by priority
 */
export function sortByPriority(decisions: Decision[]): Decision[] {
  const priorityOrder: Record<DecisionPriority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }
  
  return [...decisions].sort(
    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
  )
}
