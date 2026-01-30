/**
 * LOCUS Payments Integration Types
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ UI cannot process payments directly
 * ✅ Only through DecisionEngine / PaymentService
 */

/**
 * Payment provider
 */
export type PaymentProvider = 
  | 'yookassa'    // ЮKassa (Russian)
  | 'stripe'      // International
  | 'tinkoff'     // Tinkoff
  | 'sber'        // Sberbank
  | 'mock'        // Testing

/**
 * Payment method
 */
export type PaymentMethodType =
  | 'card'
  | 'apple_pay'
  | 'google_pay'
  | 'sbp'           // СБП (Russian fast payments)
  | 'bank_transfer'
  | 'yoomoney'      // ЮMoney wallet

/**
 * Payment status
 */
export type PaymentStatus =
  | 'pending'
  | 'waiting_capture'
  | 'succeeded'
  | 'canceled'
  | 'refunded'
  | 'failed'

/**
 * Currency
 */
export type Currency = 'RUB' | 'USD' | 'EUR'

/**
 * Payment request
 */
export interface PaymentRequest {
  id: string
  userId: string
  amount: number
  currency: Currency
  description: string
  metadata?: Record<string, unknown>
  returnUrl?: string
  capture?: boolean // Auto-capture or manual
}

/**
 * Payment result
 */
export interface PaymentResult {
  id: string
  requestId: string
  status: PaymentStatus
  amount: number
  currency: Currency
  paymentMethod?: PaymentMethodType
  confirmationUrl?: string
  capturedAt?: string
  error?: string
}

/**
 * Payment confirmation
 */
export interface PaymentConfirmation {
  paymentId: string
  status: PaymentStatus
  amount: number
  method: PaymentMethodType
  receiptUrl?: string
}

/**
 * Refund request
 */
export interface RefundRequest {
  paymentId: string
  amount?: number // Partial refund
  reason?: string
}

/**
 * Refund result
 */
export interface RefundResult {
  id: string
  paymentId: string
  status: 'pending' | 'succeeded' | 'failed'
  amount: number
  error?: string
}

/**
 * Subscription
 */
export interface Subscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'paused' | 'canceled' | 'expired'
  startDate: string
  endDate: string
  autoRenew: boolean
  paymentMethodId?: string
}

/**
 * Subscription plan
 */
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: Currency
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  features: string[]
  isPopular?: boolean
}

/**
 * Payment webhook event
 */
export interface PaymentWebhookEvent {
  type: 'payment.succeeded' | 'payment.canceled' | 'refund.succeeded' | 'subscription.renewed'
  paymentId?: string
  subscriptionId?: string
  data: Record<string, unknown>
}

/**
 * Payment integration status
 */
export interface PaymentIntegrationStatus {
  provider: PaymentProvider
  connected: boolean
  mode: 'sandbox' | 'production'
  testMode: boolean
  webhookConfigured: boolean
  lastWebhook?: string
}

/**
 * Saved payment method
 */
export interface SavedPaymentMethod {
  id: string
  userId: string
  type: PaymentMethodType
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}
