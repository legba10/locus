/**
 * LOCUS External AI Service
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * ❌ Cannot be called from UI directly
 * ❌ Cannot change ranking directly
 * ✅ Only through DecisionEngine
 */

import { logger } from '../../utils/logger'
import type { ListingCard, Listing } from '../../domain/listing.model'
import type { UserProfile } from '../../domain/userProfile.model'
import { FeatureFlags } from '../../runtime/featureFlags'
import type {
  AIProvider,
  AIModel,
  AIRequest,
  AIResponse,
  AIRequestType,
  AIIntegrationStatus,
  ListingAIAnalysis,
  AIMatchResult,
  SearchIntentAnalysis,
} from './ai.types'
import {
  buildAIContext,
  buildListingAnalysisPrompt,
  buildMatchingPrompt,
  buildSearchIntentPrompt,
  parseListingAnalysis,
  parseMatchingResponse,
  parseSearchIntent,
} from './ai.adapter'

/**
 * Integration mode
 */
let integrationMode: 'sandbox' | 'production' = 'sandbox'
let currentProvider: AIProvider = 'mock'
let currentModel: AIModel = 'mock'

/**
 * Request queue for sandbox
 */
const sandboxQueue: AIRequest[] = []

// ==========================================
// INTEGRATION CONTROL
// ==========================================

/**
 * Set integration mode
 */
export function setMode(mode: 'sandbox' | 'production'): void {
  integrationMode = mode
  logger.info('AIService', `Mode set to: ${mode}`)
}

/**
 * Set provider
 */
export function setProvider(provider: AIProvider, model: AIModel): void {
  currentProvider = provider
  currentModel = model
  logger.info('AIService', `Provider set to: ${provider}/${model}`)
}

/**
 * Get integration status
 */
export function getStatus(): AIIntegrationStatus {
  return {
    provider: currentProvider,
    connected: integrationMode === 'production' && currentProvider !== 'mock',
    model: currentModel,
    mode: integrationMode,
  }
}

/**
 * Check if integration is active
 */
export function isActive(): boolean {
  return integrationMode === 'production' && currentProvider !== 'mock'
}

// ==========================================
// CORE REQUEST HANDLING
// ==========================================

/**
 * Send request to AI
 */
async function sendRequest(request: AIRequest): Promise<AIResponse> {
  const startTime = Date.now()

  if (integrationMode === 'sandbox') {
    logger.debug('AIService', '[SANDBOX] Would send request', { type: request.type })
    sandboxQueue.push(request)
    
    // Return mock response
    return createMockResponse(request)
  }

  // Production: call actual API
  logger.info('AIService', 'Sending AI request', { type: request.type, provider: currentProvider })

  try {
    // Would call actual AI API here
    // const response = await callProvider(request)
    
    const duration = Date.now() - startTime
    logger.debug('AIService', `Request completed in ${duration}ms`)

    return createMockResponse(request) // Placeholder
  } catch (error) {
    logger.error('AIService', 'AI request failed', error)
    return {
      id: `resp_${Date.now()}`,
      requestId: request.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create mock response for sandbox
 */
function createMockResponse(request: AIRequest): AIResponse {
  return {
    id: `resp_${Date.now()}`,
    requestId: request.id,
    success: true,
    content: `[MOCK] Response for ${request.type}`,
    usage: {
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      estimatedCost: 0.001,
    },
  }
}

/**
 * Create request
 */
function createRequest(
  type: AIRequestType,
  prompt: string,
  context?: Record<string, unknown>
): AIRequest {
  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    provider: currentProvider,
    model: currentModel,
    prompt,
    context: context as any,
    options: {
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000,
    },
  }
}

// ==========================================
// HIGH-LEVEL OPERATIONS
// ==========================================

/**
 * Analyze listing quality
 */
export async function analyzeListing(
  listing: Listing | ListingCard
): Promise<ListingAIAnalysis | null> {
  if (!FeatureFlags.isEnabled('AI_ENABLED')) {
    return null
  }
  const prompt = buildListingAnalysisPrompt(listing)
  const request = createRequest('listing_score', prompt, { listingId: listing.id })
  const response = await sendRequest(request)
  
  return parseListingAnalysis(listing.id, response)
}

/**
 * Match user to listings
 */
export async function matchUserToListings(
  profile: UserProfile,
  listings: ListingCard[]
): Promise<AIMatchResult[]> {
  if (!FeatureFlags.isEnabled('AI_ENABLED')) {
    return []
  }
  const prompt = buildMatchingPrompt(profile, listings)
  const context = buildAIContext(profile.userId, profile)
  const request = createRequest('user_matching', prompt, context as any)
  const response = await sendRequest(request)
  
  return parseMatchingResponse(profile.userId, response)
}

/**
 * Analyze search intent
 */
export async function analyzeSearchIntent(
  query: string
): Promise<SearchIntentAnalysis | null> {
  if (!FeatureFlags.isEnabled('AI_ENABLED')) {
    return null
  }
  const prompt = buildSearchIntentPrompt(query)
  const request = createRequest('search_intent', prompt)
  const response = await sendRequest(request)
  
  return parseSearchIntent(query, response)
}

/**
 * Generate listing description
 */
export async function generateDescription(
  listing: Partial<Listing>
): Promise<string | null> {
  if (!FeatureFlags.isEnabled('AI_ENABLED')) {
    return null
  }
  const prompt = [
    `Generate a compelling rental listing description in Russian:`,
    `City: ${listing.city}`,
    listing.rooms ? `Rooms: ${listing.rooms}` : null,
    listing.area ? `Area: ${listing.area} m²` : null,
    listing.price ? `Price: ${listing.price} RUB/month` : null,
    ``,
    `Make it attractive but honest. 2-3 paragraphs.`,
  ].filter(Boolean).join('\n')

  const request = createRequest('listing_description', prompt, { listingId: listing.id })
  const response = await sendRequest(request)

  return response.success ? response.content || null : null
}

/**
 * Chat response (for bot)
 */
export async function getChatResponse(
  message: string,
  context?: { userId?: string; history?: Array<{ role: string; content: string }> }
): Promise<string | null> {
  if (!FeatureFlags.isEnabled('AI_ENABLED')) {
    return null
  }
  const systemPrompt = `You are a helpful assistant for LOCUS, a rental property platform. 
Help users find apartments in Russian cities. Be concise and helpful.
Respond in Russian.`

  const prompt = message
  const request = createRequest('chat_response', prompt, {
    systemPrompt,
    ...context,
  })
  const response = await sendRequest(request)

  return response.success ? response.content || null : null
}

// ==========================================
// CONTROLLED MODE (PATCH 11)
// ==========================================

export async function analyzeContext(input: {
  listing?: Listing | ListingCard
  userId?: string
  payload?: Record<string, unknown>
}): Promise<Record<string, unknown> | null> {
  if (!FeatureFlags.isEnabled('AI_ENABLED')) {
    return null
  }

  if (!input.listing) {
    return { note: 'no_listing' }
  }

  if (FeatureFlags.isEnabled('AI_READ_ONLY')) {
    const analysis = await analyzeListing(input.listing)
    return analysis ? { analysis } : null
  }

  return decideContext(input)
}

export async function decideContext(input: {
  listing?: Listing | ListingCard
  userId?: string
  payload?: Record<string, unknown>
}): Promise<Record<string, unknown> | null> {
  if (!input.listing) return null
  // Stub for future decisioning logic
  return {
    decisionHint: 'ai_decision_stub',
    listingId: input.listing.id,
  }
}

// ==========================================
// SANDBOX HELPERS
// ==========================================

/**
 * Get sandbox queue
 */
export function getSandboxQueue(): AIRequest[] {
  return [...sandboxQueue]
}

/**
 * Clear sandbox queue
 */
export function clearSandboxQueue(): void {
  sandboxQueue.length = 0
}

// ==========================================
// SERVICE NAMESPACE
// ==========================================

export const ExternalAIService = {
  // Control
  setMode,
  setProvider,
  getStatus,
  isActive,
  
  // Operations
  analyzeListing,
  matchUserToListings,
  analyzeSearchIntent,
  generateDescription,
  getChatResponse,
  analyzeContext,
  decideContext,
  
  // Sandbox
  getSandboxQueue,
  clearSandboxQueue,
}

export default ExternalAIService
