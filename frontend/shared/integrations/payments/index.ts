/**
 * LOCUS Payments Integration
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ UI cannot process payments directly
 * ✅ Only through DecisionEngine
 */

// Types
export type {
  PaymentProvider,
  PaymentMethodType,
  PaymentStatus,
  Currency,
  PaymentRequest,
  PaymentResult,
  PaymentConfirmation,
  RefundRequest,
  RefundResult,
  Subscription,
  SubscriptionPlan,
  PaymentWebhookEvent,
  PaymentIntegrationStatus,
  SavedPaymentMethod,
} from './payments.types'

// Adapter
export {
  createPaymentRequest,
  adaptPaymentResult,
  adaptWebhookToEvent,
  formatPaymentPrice,
  formatSubscriptionInterval,
  calculateSubscriptionEndDate,
  createSubscription,
  validatePaymentAmount,
} from './payments.adapter'

// Service
export {
  setMode as setPaymentsMode,
  setProvider as setPaymentsProvider,
  getStatus as getPaymentsStatus,
  isActive as isPaymentsActive,
  createPayment,
  capturePayment,
  cancelPayment,
  refundPayment,
  getPaymentStatus,
  subscribe,
  cancelSubscription,
  getUserSubscriptions,
  handleWebhook as handlePaymentWebhook,
  getSavedMethods,
  deletePaymentMethod,
  getSandboxPayments,
  getSandboxSubscriptions,
  clearSandbox as clearPaymentsSandbox,
  simulateWebhook as simulatePaymentWebhook,
  PaymentsService,
} from './payments.service'
