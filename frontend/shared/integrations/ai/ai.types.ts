/**
 * LOCUS External AI Integration Types
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Types for external AI services (OpenAI, Claude, etc.)
 * ❌ AI cannot change ranking directly
 * ✅ Only through DecisionEngine
 */

/**
 * AI provider types
 */
export type AIProvider = 'openai' | 'anthropic' | 'local' | 'mock'

/**
 * AI model types
 */
export type AIModel =
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'local-llm'
  | 'mock'

/**
 * AI request types
 */
export type AIRequestType =
  | 'listing_description'
  | 'listing_score'
  | 'user_matching'
  | 'price_analysis'
  | 'search_intent'
  | 'chat_response'

/**
 * AI request
 */
export interface AIRequest {
  id: string
  type: AIRequestType
  provider: AIProvider
  model: AIModel
  prompt: string
  context?: AIContext
  options?: AIRequestOptions
}

/**
 * AI request options
 */
export interface AIRequestOptions {
  maxTokens?: number
  temperature?: number
  topP?: number
  timeout?: number
  retries?: number
}

/**
 * AI context for requests
 */
export interface AIContext {
  userId?: string
  listingId?: string
  sessionId?: string
  previousMessages?: AIMessage[]
  metadata?: Record<string, unknown>
}

/**
 * AI message (for chat)
 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * AI response
 */
export interface AIResponse {
  id: string
  requestId: string
  success: boolean
  content?: string
  error?: string
  usage?: AIUsage
  metadata?: Record<string, unknown>
}

/**
 * AI token usage
 */
export interface AIUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCost: number
}

/**
 * Listing AI analysis
 */
export interface ListingAIAnalysis {
  listingId: string
  qualityScore: number
  descriptionQuality: number
  photoQuality: number
  priceAnalysis: {
    marketPosition: 'below' | 'at_market' | 'above'
    confidence: number
  }
  suggestions: string[]
  tags: string[]
  generatedAt: string
}

/**
 * User-Listing AI match
 */
export interface AIMatchResult {
  userId: string
  listingId: string
  score: number
  reasons: string[]
  confidence: number
}

/**
 * Search intent analysis
 */
export interface SearchIntentAnalysis {
  query: string
  intent: 'rent' | 'buy' | 'explore' | 'compare'
  extractedFilters: {
    city?: string
    priceMin?: number
    priceMax?: number
    rooms?: number
    keywords?: string[]
  }
  confidence: number
}

/**
 * AI integration status
 */
export interface AIIntegrationStatus {
  provider: AIProvider
  connected: boolean
  model: AIModel
  mode: 'sandbox' | 'production'
  quotaRemaining?: number
  lastRequest?: string
}

/**
 * AI rate limit
 */
export interface AIRateLimit {
  requestsPerMinute: number
  tokensPerMinute: number
  currentRequests: number
  currentTokens: number
  resetAt: string
}
