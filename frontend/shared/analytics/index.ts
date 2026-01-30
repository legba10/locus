/**
 * LOCUS Analytics Module
 * 
 * PATCH 5: Product Metrics
 * PATCH 6: Business Metrics
 * 
 * Usage:
 *   import { track, trackListingView, ProductMetrics } from '@/shared/analytics'
 *   track('listing_view', { listingId: '123' })
 *   const funnel = ProductMetrics.funnelMetrics(events)
 */

export type {
  EventCategory,
  EventName,
  EventProperties,
  TrackedEvent,
} from './events'

export {
  track,
  trackPageView,
  trackListingView,
  trackSearch,
  trackFavorite,
  trackError,
  trackAuth,
  flush,
  getQueuedEvents,
  setUserId,
  resetAnalytics,
} from './events'

// Product Metrics (PATCH 6)
export type {
  FunnelStage,
  MetricPeriod,
  MetricSnapshot,
  FunnelMetrics,
  ListingMetrics,
  UserMetrics,
} from './productMetrics'

export {
  calculateConversionRate,
  calculateFunnelMetrics,
  calculateListingMetrics,
  calculateUserMetrics,
  calculateEngagementScore,
  getTopListings,
  createSnapshot,
  ProductMetrics,
} from './productMetrics'

// Growth Metrics (PATCH 7)
export type {
  GrowthMetricType,
  TimeCohort,
  GrowthMetrics as GrowthMetricsType,
  UserGrowthEvaluation,
  CohortMetrics,
} from './growthMetrics'

export {
  calculateActivationRate,
  calculateRetentionRate,
  calculateChurnRisk,
  calculateMonetizationPotential,
  evaluateUserGrowth,
  calculateGrowthMetrics,
  calculateCohortMetrics,
  GrowthMetrics,
} from './growthMetrics'
