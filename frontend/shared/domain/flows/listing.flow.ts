/**
 * LOCUS Listing Flow
 * 
 * PATCH 5: User Flow Architecture
 * 
 * Defines listing user flow states and transitions.
 * Business logic MUST go through this flow, NOT in React components.
 */

import type { Listing, ListingCard } from '../listing.model'
import type { User } from '../user.model'

/**
 * Listing view flow states
 */
export type ListingViewState =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'not_found'
  | 'error'

/**
 * Listing create/edit flow states
 */
export type ListingEditState =
  | 'idle'
  | 'editing'
  | 'uploading_media'
  | 'saving'
  | 'saved'
  | 'publishing'
  | 'published'
  | 'error'

/**
 * Listing search flow states
 */
export type ListingSearchState =
  | 'idle'
  | 'searching'
  | 'loaded'
  | 'empty'
  | 'error'

/**
 * Listing flow events
 */
export type ListingFlowEvent =
  | { type: 'LOAD_START'; listingId: string }
  | { type: 'LOAD_SUCCESS'; listing: Listing }
  | { type: 'LOAD_FAILURE'; error: string }
  | { type: 'SEARCH_START'; query: SearchQuery }
  | { type: 'SEARCH_SUCCESS'; listings: ListingCard[]; total: number }
  | { type: 'SEARCH_EMPTY' }
  | { type: 'SEARCH_FAILURE'; error: string }
  | { type: 'EDIT_START' }
  | { type: 'UPLOAD_MEDIA_START' }
  | { type: 'UPLOAD_MEDIA_SUCCESS' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; listing: Listing }
  | { type: 'SAVE_FAILURE'; error: string }
  | { type: 'PUBLISH_START' }
  | { type: 'PUBLISH_SUCCESS' }
  | { type: 'PUBLISH_FAILURE'; error: string }
  | { type: 'RESET' }

/**
 * Search query
 */
export interface SearchQuery {
  query?: string
  city?: string
  priceMin?: number
  priceMax?: number
  rooms?: number[]
  page?: number
  limit?: number
}

/**
 * Listing view context
 */
export interface ListingViewContext {
  state: ListingViewState
  listing: Listing | null
  error: string | null
}

/**
 * Listing search context
 */
export interface ListingSearchContext {
  state: ListingSearchState
  listings: ListingCard[]
  total: number
  query: SearchQuery
  error: string | null
}

/**
 * Listing edit context
 */
export interface ListingEditContext {
  state: ListingEditState
  listing: Partial<Listing> | null
  error: string | null
  mediaUploading: boolean
}

/**
 * Initial contexts
 */
export const initialViewContext: ListingViewContext = {
  state: 'idle',
  listing: null,
  error: null,
}

export const initialSearchContext: ListingSearchContext = {
  state: 'idle',
  listings: [],
  total: 0,
  query: {},
  error: null,
}

export const initialEditContext: ListingEditContext = {
  state: 'idle',
  listing: null,
  error: null,
  mediaUploading: false,
}

/**
 * Listing view reducer
 */
export function listingViewReducer(
  context: ListingViewContext,
  event: ListingFlowEvent
): ListingViewContext {
  switch (event.type) {
    case 'LOAD_START':
      return { ...context, state: 'loading', error: null }
    
    case 'LOAD_SUCCESS':
      return { state: 'loaded', listing: event.listing, error: null }
    
    case 'LOAD_FAILURE':
      return { 
        ...context, 
        state: event.error.includes('not found') ? 'not_found' : 'error',
        error: event.error 
      }
    
    case 'RESET':
      return initialViewContext
    
    default:
      return context
  }
}

/**
 * Listing search reducer
 */
export function listingSearchReducer(
  context: ListingSearchContext,
  event: ListingFlowEvent
): ListingSearchContext {
  switch (event.type) {
    case 'SEARCH_START':
      return { ...context, state: 'searching', query: event.query, error: null }
    
    case 'SEARCH_SUCCESS':
      return { 
        ...context, 
        state: 'loaded', 
        listings: event.listings, 
        total: event.total 
      }
    
    case 'SEARCH_EMPTY':
      return { ...context, state: 'empty', listings: [], total: 0 }
    
    case 'SEARCH_FAILURE':
      return { ...context, state: 'error', error: event.error }
    
    case 'RESET':
      return initialSearchContext
    
    default:
      return context
  }
}

/**
 * Check if listing belongs to user
 */
export function isListingOwner(user: User | null, listing: Listing): boolean {
  if (!user) return false
  return listing.userId === user.id || listing.userId === user.supabaseId
}

/**
 * Check if listing is viewable
 */
export function isListingViewable(listing: Listing): boolean {
  return listing.status === 'published'
}

/**
 * Check if listing can be contacted
 */
export function canContactOwner(user: User | null, listing: Listing): boolean {
  // Can't contact own listing
  if (user && isListingOwner(user, listing)) return false
  // Must be published
  if (!isListingViewable(listing)) return false
  return true
}

/**
 * Get listing display price
 */
export function getListingDisplayPrice(listing: Listing): string {
  const price = listing.price || 0
  return `${price.toLocaleString('ru-RU')} ₽/мес`
}

/**
 * Get listing short address
 */
export function getListingShortAddress(listing: Listing): string {
  if (listing.address) return listing.address
  if (listing.city && listing.district) {
    return `${listing.city}, ${listing.district}`
  }
  return listing.city || 'Адрес не указан'
}

export default {
  initialViewContext,
  initialSearchContext,
  initialEditContext,
  listingViewReducer,
  listingSearchReducer,
  isListingOwner,
  isListingViewable,
  canContactOwner,
  getListingDisplayPrice,
  getListingShortAddress,
}
