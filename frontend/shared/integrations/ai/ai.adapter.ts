/**
 * LOCUS External AI Adapter
 * 
 * PATCH 7.5: Pre-Integration Architecture
 * 
 * Converts AI data to/from LOCUS domain models.
 */

import type { ListingCard, Listing } from '../../domain/listing.model'
import type { UserProfile } from '../../domain/userProfile.model'
import type { RawEvent } from '../../events/event.types'
import type {
  AIRequest,
  AIResponse,
  AIContext,
  AIMessage,
  ListingAIAnalysis,
  AIMatchResult,
  SearchIntentAnalysis,
} from './ai.types'

/**
 * Build AI context from user profile
 */
export function buildAIContext(
  userId?: string,
  profile?: UserProfile,
  listingId?: string
): AIContext {
  return {
    userId,
    listingId,
    metadata: profile ? {
      intent: profile.intent,
      engagementLevel: profile.signals.engagementLevel,
      viewedCount: profile.behavior.viewedListings.length,
      favoritesCount: profile.behavior.favoriteListings.length,
    } : undefined,
  }
}

/**
 * Build listing analysis prompt
 */
export function buildListingAnalysisPrompt(listing: Listing | ListingCard): string {
  const parts = [
    `Analyze this rental listing:`,
    `Title: ${listing.title}`,
    `Price: ${listing.price} RUB/month`,
    `City: ${listing.city}`,
  ]

  if ('description' in listing && listing.description) {
    parts.push(`Description: ${listing.description}`)
  }

  if (listing.rooms) {
    parts.push(`Rooms: ${listing.rooms}`)
  }

  if (listing.area) {
    parts.push(`Area: ${listing.area} m²`)
  }

  parts.push(``, `Provide:`)
  parts.push(`1. Quality score (0-100)`)
  parts.push(`2. Description quality assessment`)
  parts.push(`3. Price market position (below/at_market/above)`)
  parts.push(`4. Improvement suggestions`)
  parts.push(`5. Relevant tags`)

  return parts.join('\n')
}

/**
 * Build user matching prompt
 */
export function buildMatchingPrompt(
  profile: UserProfile,
  listings: ListingCard[]
): string {
  const userContext = [
    `User preferences:`,
    profile.intent.city ? `- Preferred city: ${profile.intent.city}` : null,
    profile.intent.budgetMin ? `- Min budget: ${profile.intent.budgetMin}` : null,
    profile.intent.budgetMax ? `- Max budget: ${profile.intent.budgetMax}` : null,
    profile.intent.rooms ? `- Preferred rooms: ${profile.intent.rooms.join(', ')}` : null,
    `- Viewed ${profile.behavior.viewedListings.length} listings`,
    `- Favorited ${profile.behavior.favoriteListings.length} listings`,
    `- Engagement: ${profile.signals.engagementLevel}`,
  ].filter(Boolean).join('\n')

  const listingsContext = listings.slice(0, 10).map((l, i) => 
    `${i + 1}. ${l.title} - ${l.price} RUB - ${l.city}${l.rooms ? ` - ${l.rooms} rooms` : ''}`
  ).join('\n')

  return [
    userContext,
    ``,
    `Available listings:`,
    listingsContext,
    ``,
    `Rate each listing's match to user (0-100) with reasons.`,
  ].join('\n')
}

/**
 * Build search intent prompt
 */
export function buildSearchIntentPrompt(query: string): string {
  return [
    `Analyze this real estate search query:`,
    `"${query}"`,
    ``,
    `Extract:`,
    `1. Intent (rent/buy/explore/compare)`,
    `2. City if mentioned`,
    `3. Price range if mentioned`,
    `4. Number of rooms if mentioned`,
    `5. Keywords/features`,
    `6. Confidence (0-1)`,
  ].join('\n')
}

/**
 * Parse listing analysis response
 */
export function parseListingAnalysis(
  listingId: string,
  response: AIResponse
): ListingAIAnalysis | null {
  if (!response.success || !response.content) {
    return null
  }

  // Mock parsing - in production would parse structured response
  return {
    listingId,
    qualityScore: 70,
    descriptionQuality: 65,
    photoQuality: 75,
    priceAnalysis: {
      marketPosition: 'at_market',
      confidence: 0.7,
    },
    suggestions: [
      'Добавьте больше фотографий',
      'Уточните расположение метро',
    ],
    tags: ['центр', 'метро рядом', 'ремонт'],
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Parse matching response
 */
export function parseMatchingResponse(
  userId: string,
  response: AIResponse
): AIMatchResult[] {
  if (!response.success || !response.content) {
    return []
  }

  // Mock parsing - in production would parse structured response
  return []
}

/**
 * Parse search intent response
 */
export function parseSearchIntent(
  query: string,
  response: AIResponse
): SearchIntentAnalysis | null {
  if (!response.success || !response.content) {
    return null
  }

  // Mock parsing - in production would parse structured response
  return {
    query,
    intent: 'rent',
    extractedFilters: {},
    confidence: 0.5,
  }
}

/**
 * Adapt AI response to raw event
 */
export function adaptAIResponseToEvent(response: AIResponse): RawEvent {
  return {
    source: 'ai',
    type: 'ai_response',
    data: {
      requestId: response.requestId,
      success: response.success,
      usage: response.usage,
    },
  }
}

/**
 * Create chat messages
 */
export function createChatMessages(
  systemPrompt: string,
  userMessage: string,
  history?: AIMessage[]
): AIMessage[] {
  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
  ]

  if (history) {
    messages.push(...history)
  }

  messages.push({ role: 'user', content: userMessage })

  return messages
}

export default {
  buildAIContext,
  buildListingAnalysisPrompt,
  buildMatchingPrompt,
  buildSearchIntentPrompt,
  parseListingAnalysis,
  parseMatchingResponse,
  parseSearchIntent,
  adaptAIResponseToEvent,
  createChatMessages,
}
