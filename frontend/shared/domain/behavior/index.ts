/**
 * LOCUS Behavior Module
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * Controls user behavior through policies.
 */

export type { PolicyDecision, LimitConfig } from './behavior.policy'

export {
  shouldLimitContacts,
  shouldRequirePayment,
  shouldForceAuth,
  shouldShowRegistrationWall,
  shouldPushPremium,
  shouldSuggestBoost,
  checkFavoritesLimit,
  checkSearchLimit,
  BehaviorPolicy,
} from './behavior.policy'
