/**
 * LOCUS AI Module
 * 
 * PATCH 5: AI Foundation
 * PATCH 6: Smart Product Engine
 * 
 * Architecture is ready for real AI.
 * Currently uses deterministic implementations.
 * 
 * Usage:
 *   import { AIService, RankingService, UserIntelligenceService } from '@/shared/ai'
 */

// Intelligence Service (PATCH 5)
export type {
  ExtendedIntelligence,
  UserPreferences,
  AIMatchResult,
  PriceAnalysis,
  DemandPrediction,
} from './intelligence.service'

export {
  generateIntelligence,
  matchListings,
  analyzePrices,
  predictDemand,
  getSuggestions,
  AIService,
} from './intelligence.service'

// User Intelligence Service (PATCH 6)
export {
  buildProfile,
  updateProfile,
  convertAnalyticsEvents,
  getProfileSummary,
  UserIntelligenceService,
} from './userIntelligence.service'

// Ranking Service (PATCH 6)
export {
  rankListings,
  getTopListings as getTopRankedListings,
  getListingScore,
  compareListings,
  fallbackRanking,
  RankingService,
} from './ranking.service'

// Market Balance Service (PATCH 7)
export type {
  BalanceStatus,
  BalanceAction,
  MarketBalance,
} from './marketBalance.service'

export {
  evaluateBalance,
  evaluateBalanceByCity,
  getSupplyBoostRecommendations,
  getDemandBoostRecommendations,
  getCitiesNeedingAttention,
  MarketBalanceService,
} from './marketBalance.service'

// Growth Service (PATCH 7)
export type {
  GrowthAction,
  GrowthEvaluation,
  PlatformGrowthState,
} from './growth.service'

export {
  evaluateUser as evaluateUserGrowth,
  evaluatePlatform,
  getUsersNeedingAttention,
  getChurnPreventionActions,
  GrowthService,
} from './growth.service'
