/**
 * LOCUS Integrations Module
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * 🔒 ARCHITECTURE RULES:
 * ❌ UI cannot call integrations directly
 * ❌ Integrations cannot mutate domain models
 * ❌ AI cannot change ranking directly
 * ❌ Telegram cannot change user state directly
 * 
 * ✅ Only through:
 * - DecisionEngine
 * - ProductFlow
 * - UserIntelligenceService
 * - RankingService
 */

// Telegram
export * from './telegram'

// External AI
export * from './ai'

// Payments
export * from './payments'

// Firewall (Patch 8)
export * from './firewall'

// Sandbox Control
export type { IntegrationMode, IntegrationModes } from './sandbox'
export {
  setIntegrationMode,
  setAllModes,
  getModes,
  hasProductionIntegration,
  allInSandbox,
  IntegrationFlags,
  isFeatureEnabled,
  enableFeature,
  disableFeature,
  resetToSandbox,
} from './sandbox'
