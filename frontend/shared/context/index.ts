/**
 * LOCUS Context Module
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Unified context for all decision-making.
 */

export type {
  DecisionSource,
  GlobalContext,
  ContextFlags,
  DecisionInput,
  ContextSnapshot,
  ContextDiff,
} from './context.types'

export { DEFAULT_FLAGS } from './context.types'

export {
  buildContext,
  buildUIContext,
  buildTelegramContext,
  buildAIContext,
  getCachedContext,
  invalidateCache,
  createSnapshot,
  getSnapshots,
  diffContexts,
  isContextAuthenticated,
  hasProfileData,
  isReadyForPersonalization,
  getContextSummary,
  ContextBuilder,
} from './context.builder'
