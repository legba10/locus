/**
 * LOCUS Market Module
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * ❌ UI cannot know market state
 * ✅ Only through MarketService
 */

export type {
  CompetitionLevel,
  MarketTrend,
  MarketSegment,
  MarketState,
  MarketPressure,
  MarketHealth,
  CityMarketSummary,
} from './market.model'

export {
  createEmptyMarketState,
  calculateCompetitionLevel,
  calculateTrend,
  calculateMarketHealth,
  calculateMarketPressure,
} from './market.model'

export {
  calculateMarketState,
  calculateCityMarket,
  getListingMarketPressure,
  getListingCompetition,
  getPriceRecommendation,
  getMarketInsights,
  MarketService,
} from './market.service'
