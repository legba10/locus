/**
 * LOCUS Strategy Module
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * ❌ UI cannot know strategy
 * ✅ Only through ProductStrategy
 */

export type {
  StrategyMode,
  StrategyPriority,
  StrategyConfig,
  StrategyInput,
  StrategyOutput,
  StrategyKPI,
  StrategyAlert,
} from './product.strategy'

export {
  resolveStrategy,
  getStrategyConfig,
  shouldPrioritizeMonetization,
  shouldPrioritizeGrowth,
  shouldPrioritizeSupply,
  getMonetizationLevel,
  ProductStrategy,
} from './product.strategy'
