/**
 * LOCUS Decision Module
 * 
 * PATCH 7: Self-Managing Growth Platform
 * 
 * ❌ UI cannot make decisions
 * ✅ Only through DecisionEngine
 */

export type {
  DecisionType,
  DecisionPriority,
  DecisionUrgency,
  MonetizationLevel,
  DecisionContext,
  Decision,
  DecisionResult,
  DecisionRule,
} from './decision.model'

export {
  createDecisionContext,
  createDecision,
  getDecisionDisplay,
  sortByPriority,
} from './decision.model'

export {
  resolveDecisions,
  resolve,
  shouldDecide,
  getDecisionsOfType,
  forceBoostSupply,
  forceLimitDemand,
  forceMonetization,
  DecisionEngine,
} from './decision.engine'
