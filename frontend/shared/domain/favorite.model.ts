/**
 * LOCUS Favorite Domain Model
 * 
 * PATCH 5: Favorites Feature
 * 
 * This is the single source of truth for favorite data.
 */

import type { ListingCard } from './listing.model'

/**
 * Favorite entity
 */
export interface Favorite {
  id: string
  userId: string
  listingId: string
  createdAt: string
  
  // Optional expanded listing
  listing?: ListingCard
}

/**
 * Favorite with listing (for display)
 */
export interface FavoriteWithListing extends Favorite {
  listing: ListingCard
}

/**
 * Favorites collection summary
 */
export interface FavoritesSummary {
  total: number
  recentIds: string[]
  lastUpdated: string | null
}

/**
 * Check if favorite has expanded listing
 */
export function hasFavoriteListing(
  favorite: Favorite
): favorite is FavoriteWithListing {
  return favorite.listing !== undefined && favorite.listing !== null
}

/**
 * Create empty favorites summary
 */
export function createEmptyFavoritesSummary(): FavoritesSummary {
  return {
    total: 0,
    recentIds: [],
    lastUpdated: null,
  }
}

/**
 * Calculate favorites summary from list
 */
export function calculateFavoritesSummary(favorites: Favorite[]): FavoritesSummary {
  return {
    total: favorites.length,
    recentIds: favorites.slice(0, 5).map(f => f.listingId),
    lastUpdated: favorites.length > 0 
      ? favorites[0].createdAt 
      : null,
  }
}
