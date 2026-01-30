/**
 * LOCUS Payments Adapter
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Converts payment data to/from LOCUS domain models.
 */

import type { PaymentIntent, PricingTier } from '../../domain/paymentIntent.model'
import type { RawEvent } from '../../events/event.types'
import type {
  PaymentRequest,
  PaymentResult,
  PaymentConfirmation,
  PaymentWebhookEvent,
  Subscription,
  SubscriptionPlan,
} from './payments.types'

/**
 * Convert PricingTier to PaymentRequest
 */
export function createPaymentRequest(
  userId: string,
  tier: PricingTier,
  listingId?: string
): PaymentRequest {
  return {
    id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    amount: tier.price,
    currency: tier.currency,
    description: tier.name,
    metadata: {
      tierId: tier.id,
      tierType: tier.type,
      listingId,
      durationDays: tier.durationDays,
    },
  }
}

/**
 * Convert PaymentResult to PaymentIntent update
 */
export function adaptPaymentResult(
  result: PaymentResult,
  originalIntent: PaymentIntent
): Partial<PaymentIntent> {
  return {
    status: result.status === 'succeeded' ? 'completed' :
            result.status === 'canceled' ? 'cancelled' :
            result.status === 'failed' ? 'failed' :
            result.status === 'refunded' ? 'refunded' :
            'processing',
    paymentMethod: result.paymentMethod as any,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Adapt webhook event to raw event
 */
export function adaptWebhookToEvent(webhook: PaymentWebhookEvent): RawEvent {
  return {
    source: 'payment' as any,
    type: `payment_${webhook.type}`,
    data: {
      paymentId: webhook.paymentId,
      subscriptionId: webhook.subscriptionId,
      ...webhook.data,
    },
  }
}

/**
 * Format price for display
 */
export function formatPaymentPrice(
  amount: number,
  currency: 'RUB' | 'USD' | 'EUR'
): string {
  const value = amount / 100 // From kopeks/cents

  switch (currency) {
    case 'RUB':
      return `${value.toLocaleString('ru-RU')} ₽`
    case 'USD':
      return `$${value.toLocaleString('en-US')}`
    case 'EUR':
      return `€${value.toLocaleString('de-DE')}`
    default:
      return `${value} ${currency}`
  }
}

/**
 * Format subscription interval
 */
export function formatSubscriptionInterval(
  plan: SubscriptionPlan
): string {
  const intervals: Record<string, string> = {
    day: 'день',
    week: 'неделю',
    month: 'месяц',
    year: 'год',
  }

  const interval = intervals[plan.interval] || plan.interval

  if (plan.intervalCount === 1) {
    return `в ${interval}`
  }

  return `каждые ${plan.intervalCount} ${interval}`
}

/**
 * Calculate subscription end date
 */
export function calculateSubscriptionEndDate(
  startDate: Date,
  plan: SubscriptionPlan
): Date {
  const end = new Date(startDate)

  switch (plan.interval) {
    case 'day':
      end.setDate(end.getDate() + plan.intervalCount)
      break
    case 'week':
      end.setDate(end.getDate() + plan.intervalCount * 7)
      break
    case 'month':
      end.setMonth(end.getMonth() + plan.intervalCount)
      break
    case 'year':
      end.setFullYear(end.getFullYear() + plan.intervalCount)
      break
  }

  return end
}

/**
 * Create subscription from plan
 */
export function createSubscription(
  userId: string,
  plan: SubscriptionPlan
): Subscription {
  const startDate = new Date()
  const endDate = calculateSubscriptionEndDate(startDate, plan)

  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    planId: plan.id,
    status: 'active',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    autoRenew: true,
  }
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
  amount: number,
  currency: 'RUB' | 'USD' | 'EUR'
): { valid: boolean; error?: string } {
  const minAmounts: Record<string, number> = {
    RUB: 100,    // 1 RUB
    USD: 50,     // $0.50
    EUR: 50,     // €0.50
  }

  const maxAmounts: Record<string, number> = {
    RUB: 100000000,  // 1M RUB
    USD: 1000000,    // $10K
    EUR: 1000000,    // €10K
  }

  if (amount < minAmounts[currency]) {
    return { 
      valid: false, 
      error: `Минимальная сумма: ${formatPaymentPrice(minAmounts[currency], currency)}` 
    }
  }

  if (amount > maxAmounts[currency]) {
    return { 
      valid: false, 
      error: `Максимальная сумма: ${formatPaymentPrice(maxAmounts[currency], currency)}` 
    }
  }

  return { valid: true }
}

export default {
  createPaymentRequest,
  adaptPaymentResult,
  adaptWebhookToEvent,
  formatPaymentPrice,
  formatSubscriptionInterval,
  calculateSubscriptionEndDate,
  createSubscription,
  validatePaymentAmount,
}
