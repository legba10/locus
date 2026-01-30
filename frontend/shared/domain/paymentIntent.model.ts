/**
 * LOCUS Payment Intent Domain Model
 * 
 * PATCH 6: Monetization Foundation
 * 
 * Prepares LOCUS for monetization without implementing payments.
 */

/**
 * Payment intent types
 */
export type PaymentIntentType =
  | 'boost'        // Promote listing in search
  | 'contact'      // Pay to see contact info
  | 'subscription' // Monthly subscription
  | 'premium'      // Premium features
  | 'featured'     // Featured listing slot

/**
 * Payment intent status
 */
export type PaymentIntentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'

/**
 * Payment method types
 */
export type PaymentMethod =
  | 'card'
  | 'apple_pay'
  | 'google_pay'
  | 'sbp'         // Russian fast payment system
  | 'bank_transfer'

/**
 * Payment Intent
 */
export interface PaymentIntent {
  id: string
  userId: string
  
  /** What they're paying for */
  type: PaymentIntentType
  
  /** Related listing (for boost/contact/featured) */
  listingId?: string
  
  /** Amount in kopeks (1 RUB = 100 kopeks) */
  amount: number
  
  /** Currency */
  currency: 'RUB' | 'USD'
  
  /** Current status */
  status: PaymentIntentStatus
  
  /** Payment method used */
  paymentMethod?: PaymentMethod
  
  /** Metadata */
  metadata?: Record<string, unknown>
  
  /** Duration for subscriptions (days) */
  durationDays?: number
  
  /** Start date for time-limited purchases */
  startsAt?: string
  
  /** End date for time-limited purchases */
  expiresAt?: string
  
  /** Created timestamp */
  createdAt: string
  
  /** Updated timestamp */
  updatedAt: string
}

/**
 * Pricing configuration
 */
export interface PricingTier {
  id: string
  type: PaymentIntentType
  name: string
  description: string
  price: number
  currency: 'RUB' | 'USD'
  durationDays?: number
  features: string[]
  isPopular?: boolean
}

/**
 * Default pricing tiers (can be overridden by backend)
 */
export const DEFAULT_PRICING: PricingTier[] = [
  {
    id: 'boost_7',
    type: 'boost',
    name: 'Поднять на 7 дней',
    description: 'Ваше объявление будет показываться выше в поиске',
    price: 29900, // 299 RUB
    currency: 'RUB',
    durationDays: 7,
    features: [
      'Приоритет в поиске',
      'Значок "Продвигаемое"',
      '+50% просмотров',
    ],
  },
  {
    id: 'boost_30',
    type: 'boost',
    name: 'Поднять на 30 дней',
    description: 'Максимальная видимость на месяц',
    price: 79900, // 799 RUB
    currency: 'RUB',
    durationDays: 30,
    features: [
      'Топ позиция в поиске',
      'Значок "Продвигаемое"',
      '+100% просмотров',
      'Выделение в списке',
    ],
    isPopular: true,
  },
  {
    id: 'featured',
    type: 'featured',
    name: 'Премиум размещение',
    description: 'Показ на главной странице',
    price: 149900, // 1499 RUB
    currency: 'RUB',
    durationDays: 7,
    features: [
      'Баннер на главной',
      'Топ в категории',
      'Push-уведомления подписчикам',
      '+200% просмотров',
    ],
  },
  {
    id: 'subscription_monthly',
    type: 'subscription',
    name: 'Подписка владельца',
    description: 'Все возможности для арендодателей',
    price: 99900, // 999 RUB/month
    currency: 'RUB',
    durationDays: 30,
    features: [
      'Неограниченные объявления',
      'Статистика просмотров',
      'Приоритетная поддержка',
      'Автопродление объявлений',
    ],
  },
]

/**
 * Create payment intent
 */
export function createPaymentIntent(
  userId: string,
  tier: PricingTier,
  listingId?: string
): PaymentIntent {
  const now = new Date().toISOString()
  
  return {
    id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: tier.type,
    listingId,
    amount: tier.price,
    currency: tier.currency,
    status: 'pending',
    durationDays: tier.durationDays,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Check if payment intent is active
 */
export function isPaymentIntentActive(intent: PaymentIntent): boolean {
  if (intent.status !== 'completed') return false
  
  if (intent.expiresAt) {
    return new Date(intent.expiresAt) > new Date()
  }
  
  return true
}

/**
 * Get display price
 */
export function formatPrice(amount: number, currency: 'RUB' | 'USD'): string {
  const value = amount / 100 // Convert from kopeks/cents
  
  if (currency === 'RUB') {
    return `${value.toLocaleString('ru-RU')} ₽`
  }
  
  return `$${value.toLocaleString('en-US')}`
}

/**
 * Get tier by ID
 */
export function getTierById(id: string): PricingTier | undefined {
  return DEFAULT_PRICING.find(t => t.id === id)
}

/**
 * Get tiers by type
 */
export function getTiersByType(type: PaymentIntentType): PricingTier[] {
  return DEFAULT_PRICING.filter(t => t.type === type)
}

/**
 * Type guard
 */
export function isPaymentIntent(obj: unknown): obj is PaymentIntent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as PaymentIntent).id === 'string' &&
    typeof (obj as PaymentIntent).userId === 'string' &&
    typeof (obj as PaymentIntent).type === 'string' &&
    typeof (obj as PaymentIntent).amount === 'number'
  )
}
