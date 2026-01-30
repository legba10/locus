/**
 * LOCUS Payments Service
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ Cannot be called from UI directly
 * ✅ Only through DecisionEngine
 */

import { logger } from '../../utils/logger'
import type { PricingTier } from '../../domain/paymentIntent.model'
import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentConfirmation,
  RefundRequest,
  RefundResult,
  Subscription,
  SubscriptionPlan,
  PaymentIntegrationStatus,
  PaymentWebhookEvent,
  SavedPaymentMethod,
} from './payments.types'
import {
  createPaymentRequest,
  adaptWebhookToEvent,
  createSubscription,
  validatePaymentAmount,
} from './payments.adapter'
import type { RawEvent } from '../../events/event.types'

/**
 * Integration mode
 */
let integrationMode: 'sandbox' | 'production' = 'sandbox'
let currentProvider: PaymentProvider = 'mock'

/**
 * Sandbox storage
 */
const sandboxPayments: PaymentResult[] = []
const sandboxSubscriptions: Subscription[] = []

// ==========================================
// INTEGRATION CONTROL
// ==========================================

/**
 * Set integration mode
 */
export function setMode(mode: 'sandbox' | 'production'): void {
  integrationMode = mode
  logger.info('PaymentsService', `Mode set to: ${mode}`)
}

/**
 * Set provider
 */
export function setProvider(provider: PaymentProvider): void {
  currentProvider = provider
  logger.info('PaymentsService', `Provider set to: ${provider}`)
}

/**
 * Get integration status
 */
export function getStatus(): PaymentIntegrationStatus {
  return {
    provider: currentProvider,
    connected: integrationMode === 'production' && currentProvider !== 'mock',
    mode: integrationMode,
    testMode: integrationMode === 'sandbox',
    webhookConfigured: false,
  }
}

/**
 * Check if integration is active
 */
export function isActive(): boolean {
  return integrationMode === 'production' && currentProvider !== 'mock'
}

// ==========================================
// PAYMENTS
// ==========================================

/**
 * Create payment
 */
export async function createPayment(
  userId: string,
  tier: PricingTier,
  listingId?: string
): Promise<PaymentResult> {
  const request = createPaymentRequest(userId, tier, listingId)
  
  // Validate
  const validation = validatePaymentAmount(request.amount, request.currency)
  if (!validation.valid) {
    return {
      id: '',
      requestId: request.id,
      status: 'failed',
      amount: request.amount,
      currency: request.currency,
      error: validation.error,
    }
  }

  if (integrationMode === 'sandbox') {
    logger.debug('PaymentsService', '[SANDBOX] Creating payment', request)
    return createMockPayment(request)
  }

  // Production: call payment provider
  logger.info('PaymentsService', 'Creating payment', { 
    provider: currentProvider,
    amount: request.amount 
  })

  // Would call actual payment API
  return createMockPayment(request)
}

/**
 * Create mock payment
 */
function createMockPayment(request: PaymentRequest): PaymentResult {
  const result: PaymentResult = {
    id: `mock_${Date.now()}`,
    requestId: request.id,
    status: 'waiting_capture',
    amount: request.amount,
    currency: request.currency,
    confirmationUrl: `https://mock-payment.test/confirm/${request.id}`,
  }

  sandboxPayments.push(result)
  return result
}

/**
 * Capture payment
 */
export async function capturePayment(paymentId: string): Promise<PaymentResult | null> {
  if (integrationMode === 'sandbox') {
    const payment = sandboxPayments.find(p => p.id === paymentId)
    if (payment) {
      payment.status = 'succeeded'
      payment.capturedAt = new Date().toISOString()
      return payment
    }
    return null
  }

  // Production: call provider
  logger.info('PaymentsService', 'Capturing payment', { paymentId })
  return null
}

/**
 * Cancel payment
 */
export async function cancelPayment(paymentId: string): Promise<boolean> {
  if (integrationMode === 'sandbox') {
    const payment = sandboxPayments.find(p => p.id === paymentId)
    if (payment) {
      payment.status = 'canceled'
      return true
    }
    return false
  }

  // Production: call provider
  logger.info('PaymentsService', 'Canceling payment', { paymentId })
  return true
}

/**
 * Refund payment
 */
export async function refundPayment(request: RefundRequest): Promise<RefundResult> {
  if (integrationMode === 'sandbox') {
    logger.debug('PaymentsService', '[SANDBOX] Refunding payment', request)
    return {
      id: `refund_${Date.now()}`,
      paymentId: request.paymentId,
      status: 'succeeded',
      amount: request.amount || 0,
    }
  }

  // Production: call provider
  logger.info('PaymentsService', 'Processing refund', { paymentId: request.paymentId })
  return {
    id: '',
    paymentId: request.paymentId,
    status: 'pending',
    amount: request.amount || 0,
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentResult | null> {
  if (integrationMode === 'sandbox') {
    return sandboxPayments.find(p => p.id === paymentId) || null
  }

  // Production: call provider
  return null
}

// ==========================================
// SUBSCRIPTIONS
// ==========================================

/**
 * Create subscription
 */
export async function subscribe(
  userId: string,
  plan: SubscriptionPlan
): Promise<Subscription> {
  if (integrationMode === 'sandbox') {
    logger.debug('PaymentsService', '[SANDBOX] Creating subscription', { userId, plan: plan.id })
    const subscription = createSubscription(userId, plan)
    sandboxSubscriptions.push(subscription)
    return subscription
  }

  // Production: call provider
  logger.info('PaymentsService', 'Creating subscription', { userId, plan: plan.id })
  return createSubscription(userId, plan)
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (integrationMode === 'sandbox') {
    const sub = sandboxSubscriptions.find(s => s.id === subscriptionId)
    if (sub) {
      sub.status = 'canceled'
      sub.autoRenew = false
      return true
    }
    return false
  }

  // Production: call provider
  logger.info('PaymentsService', 'Canceling subscription', { subscriptionId })
  return true
}

/**
 * Get user subscriptions
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  if (integrationMode === 'sandbox') {
    return sandboxSubscriptions.filter(s => s.userId === userId)
  }

  // Production: call provider
  return []
}

// ==========================================
// WEBHOOKS
// ==========================================

/**
 * Handle webhook
 */
export function handleWebhook(body: unknown): {
  ok: boolean
  event?: RawEvent
  error?: string
} {
  try {
    const webhookEvent = body as PaymentWebhookEvent
    const event = adaptWebhookToEvent(webhookEvent)
    
    logger.info('PaymentsService', 'Webhook received', { type: webhookEvent.type })
    
    return { ok: true, event }
  } catch (error) {
    logger.error('PaymentsService', 'Webhook error', error)
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// ==========================================
// PAYMENT METHODS
// ==========================================

/**
 * Get saved payment methods
 */
export async function getSavedMethods(userId: string): Promise<SavedPaymentMethod[]> {
  if (integrationMode === 'sandbox') {
    return []
  }

  // Production: call provider
  return []
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(methodId: string): Promise<boolean> {
  if (integrationMode === 'sandbox') {
    return true
  }

  // Production: call provider
  return true
}

// ==========================================
// SANDBOX HELPERS
// ==========================================

/**
 * Get sandbox payments
 */
export function getSandboxPayments(): PaymentResult[] {
  return [...sandboxPayments]
}

/**
 * Get sandbox subscriptions
 */
export function getSandboxSubscriptions(): Subscription[] {
  return [...sandboxSubscriptions]
}

/**
 * Clear sandbox data
 */
export function clearSandbox(): void {
  sandboxPayments.length = 0
  sandboxSubscriptions.length = 0
}

/**
 * Simulate webhook
 */
export function simulateWebhook(
  type: PaymentWebhookEvent['type'],
  data: Record<string, unknown>
): RawEvent {
  const webhook: PaymentWebhookEvent = { type, data }
  return adaptWebhookToEvent(webhook)
}

// ==========================================
// SERVICE NAMESPACE
// ==========================================

export const PaymentsService = {
  // Control
  setMode,
  setProvider,
  getStatus,
  isActive,
  
  // Payments
  createPayment,
  capturePayment,
  cancelPayment,
  refundPayment,
  getPaymentStatus,
  
  // Subscriptions
  subscribe,
  cancelSubscription,
  getUserSubscriptions,
  
  // Webhooks
  handleWebhook,
  
  // Payment methods
  getSavedMethods,
  deletePaymentMethod,
  
  // Sandbox
  getSandboxPayments,
  getSandboxSubscriptions,
  clearSandbox,
  simulateWebhook,
}

export default PaymentsService
