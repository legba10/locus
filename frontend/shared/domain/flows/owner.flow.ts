/**
 * LOCUS Owner Flow
 * 
 * PATCH 5: User Flow Architecture
 * 
 * Defines owner dashboard flow states and transitions.
 * Business logic MUST go through this flow, NOT in React components.
 */

import type { Listing } from '../listing.model'
import type { User } from '../user.model'

/**
 * Owner dashboard flow states
 */
export type OwnerDashboardState =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'empty'
  | 'error'

/**
 * Listing management states
 */
export type ListingManageState =
  | 'idle'
  | 'creating'
  | 'editing'
  | 'deleting'
  | 'publishing'
  | 'archiving'
  | 'success'
  | 'error'

/**
 * Owner flow events
 */
export type OwnerFlowEvent =
  | { type: 'LOAD_LISTINGS_START' }
  | { type: 'LOAD_LISTINGS_SUCCESS'; listings: Listing[] }
  | { type: 'LOAD_LISTINGS_EMPTY' }
  | { type: 'LOAD_LISTINGS_FAILURE'; error: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; listing: Listing }
  | { type: 'CREATE_FAILURE'; error: string }
  | { type: 'EDIT_START'; listingId: string }
  | { type: 'EDIT_SUCCESS'; listing: Listing }
  | { type: 'EDIT_FAILURE'; error: string }
  | { type: 'DELETE_START'; listingId: string }
  | { type: 'DELETE_SUCCESS'; listingId: string }
  | { type: 'DELETE_FAILURE'; error: string }
  | { type: 'PUBLISH_START'; listingId: string }
  | { type: 'PUBLISH_SUCCESS'; listingId: string }
  | { type: 'PUBLISH_FAILURE'; error: string }
  | { type: 'ARCHIVE_START'; listingId: string }
  | { type: 'ARCHIVE_SUCCESS'; listingId: string }
  | { type: 'ARCHIVE_FAILURE'; error: string }
  | { type: 'RESET' }

/**
 * Owner dashboard context
 */
export interface OwnerDashboardContext {
  state: OwnerDashboardState
  listings: Listing[]
  manageState: ListingManageState
  currentListingId: string | null
  stats: OwnerStats
  error: string | null
}

/**
 * Owner statistics
 */
export interface OwnerStats {
  totalListings: number
  publishedListings: number
  draftListings: number
  archivedListings: number
  totalViews: number
  totalFavorites: number
}

/**
 * Initial context
 */
export const initialOwnerContext: OwnerDashboardContext = {
  state: 'idle',
  listings: [],
  manageState: 'idle',
  currentListingId: null,
  stats: {
    totalListings: 0,
    publishedListings: 0,
    draftListings: 0,
    archivedListings: 0,
    totalViews: 0,
    totalFavorites: 0,
  },
  error: null,
}

/**
 * Calculate stats from listings
 */
function calculateStats(listings: Listing[]): OwnerStats {
  return {
    totalListings: listings.length,
    publishedListings: listings.filter(l => l.status === 'published').length,
    draftListings: listings.filter(l => l.status === 'draft').length,
    archivedListings: listings.filter(l => l.status === 'archived').length,
    totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
    totalFavorites: listings.reduce((sum, l) => sum + (l.favoritesCount || 0), 0),
  }
}

/**
 * Owner dashboard reducer
 */
export function ownerDashboardReducer(
  context: OwnerDashboardContext,
  event: OwnerFlowEvent
): OwnerDashboardContext {
  switch (event.type) {
    case 'LOAD_LISTINGS_START':
      return { ...context, state: 'loading', error: null }

    case 'LOAD_LISTINGS_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        listings: event.listings,
        stats: calculateStats(event.listings),
        error: null,
      }

    case 'LOAD_LISTINGS_EMPTY':
      return {
        ...context,
        state: 'empty',
        listings: [],
        stats: calculateStats([]),
      }

    case 'LOAD_LISTINGS_FAILURE':
      return { ...context, state: 'error', error: event.error }

    case 'CREATE_START':
      return { ...context, manageState: 'creating' }

    case 'CREATE_SUCCESS':
      return {
        ...context,
        manageState: 'success',
        listings: [event.listing, ...context.listings],
        stats: calculateStats([event.listing, ...context.listings]),
      }

    case 'CREATE_FAILURE':
      return { ...context, manageState: 'error', error: event.error }

    case 'EDIT_START':
      return { ...context, manageState: 'editing', currentListingId: event.listingId }

    case 'EDIT_SUCCESS':
      return {
        ...context,
        manageState: 'success',
        listings: context.listings.map(l => 
          l.id === event.listing.id ? event.listing : l
        ),
        currentListingId: null,
      }

    case 'DELETE_START':
      return { ...context, manageState: 'deleting', currentListingId: event.listingId }

    case 'DELETE_SUCCESS':
      const remainingListings = context.listings.filter(l => l.id !== event.listingId)
      return {
        ...context,
        manageState: 'success',
        listings: remainingListings,
        stats: calculateStats(remainingListings),
        currentListingId: null,
      }

    case 'PUBLISH_START':
      return { ...context, manageState: 'publishing', currentListingId: event.listingId }

    case 'PUBLISH_SUCCESS':
      return {
        ...context,
        manageState: 'success',
        listings: context.listings.map(l =>
          l.id === event.listingId ? { ...l, status: 'published' as const } : l
        ),
        stats: calculateStats(
          context.listings.map(l =>
            l.id === event.listingId ? { ...l, status: 'published' as const } : l
          )
        ),
        currentListingId: null,
      }

    case 'ARCHIVE_START':
      return { ...context, manageState: 'archiving', currentListingId: event.listingId }

    case 'ARCHIVE_SUCCESS':
      return {
        ...context,
        manageState: 'success',
        listings: context.listings.map(l =>
          l.id === event.listingId ? { ...l, status: 'archived' as const } : l
        ),
        stats: calculateStats(
          context.listings.map(l =>
            l.id === event.listingId ? { ...l, status: 'archived' as const } : l
          )
        ),
        currentListingId: null,
      }

    case 'RESET':
      return initialOwnerContext

    default:
      return context
  }
}

/**
 * Check if user is owner
 */
export function isOwner(user: User | null): boolean {
  if (!user) return false
  return user.roles.includes('landlord') || user.role === 'landlord'
}

/**
 * Check if user can access owner dashboard
 */
export function canAccessDashboard(user: User | null): boolean {
  return isOwner(user)
}

/**
 * Check if listing can be published
 */
export function canPublishListing(listing: Listing): boolean {
  // Must be draft
  if (listing.status !== 'draft') return false
  // Must have title and price
  if (!listing.title || !listing.price) return false
  // Must have at least one photo
  if (!listing.media || listing.media.length === 0) return false
  return true
}

/**
 * Get listing action label
 */
export function getListingActionLabel(listing: Listing): string {
  switch (listing.status) {
    case 'draft': return 'Опубликовать'
    case 'published': return 'Архивировать'
    case 'archived': return 'Восстановить'
    default: return 'Действие'
  }
}

export default {
  initialOwnerContext,
  ownerDashboardReducer,
  isOwner,
  canAccessDashboard,
  canPublishListing,
  getListingActionLabel,
}
