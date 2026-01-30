/**
 * LOCUS External AI Integration
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ UI cannot call directly
 * ❌ Cannot change ranking directly
 * ✅ Only through DecisionEngine
 */

// Types
export type {
  AIProvider,
  AIModel,
  AIRequestType,
  AIRequest,
  AIRequestOptions,
  AIContext,
  AIMessage,
  AIResponse,
  AIUsage,
  ListingAIAnalysis,
  AIMatchResult,
  SearchIntentAnalysis,
  AIIntegrationStatus,
  AIRateLimit,
} from './ai.types'

// Adapter
export {
  buildAIContext,
  buildListingAnalysisPrompt,
  buildMatchingPrompt,
  buildSearchIntentPrompt,
  parseListingAnalysis,
  parseMatchingResponse,
  parseSearchIntent,
  adaptAIResponseToEvent,
  createChatMessages,
} from './ai.adapter'

// Service
export {
  setMode as setAIMode,
  setProvider as setAIProvider,
  getStatus as getAIStatus,
  isActive as isAIActive,
  analyzeListing,
  matchUserToListings,
  analyzeSearchIntent,
  generateDescription,
  getChatResponse,
  analyzeContext,
  decideContext,
  getSandboxQueue as getAISandboxQueue,
  clearSandboxQueue as clearAISandboxQueue,
  ExternalAIService,
} from './ai.service'
