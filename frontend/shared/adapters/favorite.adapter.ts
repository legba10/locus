/**
 * LOCUS Favorite Adapter
 * 
 * PATCH 5: Favorites Feature
 * 
 * Converts raw API data to domain models.
 * UI must NEVER use raw API data directly.
 */

import type { Favorite, FavoriteWithListing } from '../domain/favorite.model'
import { adaptListingCard, type RawApiListing } from './listing.adapter'

/**
 * Raw API favorite response
 */
export interface RawApiFavorite {
  id?: string
  user_id?: string
  userId?: string
  listing_id?: string
  listingId?: string
  created_at?: string
  createdAt?: string
  listing?: RawApiListing
  Listing?: RawApiListing
}

/**
 * Adapt single favorite from API
 */
export function adaptFavorite(raw: RawApiFavorite): Favorite {
  const listing = raw.listing || raw.Listing
  
  return {
    id: raw.id || '',
    userId: raw.user_id || raw.userId || '',
    listingId: raw.listing_id || raw.listingId || '',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    listing: listing ? adaptListingCard(listing) : undefined,
  }
}

/**
 * Adapt favorite with listing (ensures listing exists)
 */
export function adaptFavoriteWithListing(raw: RawApiFavorite): FavoriteWithListing | null {
  const favorite = adaptFavorite(raw)
  
  if (!favorite.listing) {
    return null
  }
  
  return favorite as FavoriteWithListing
}

/**
 * Adapt array of favorites
 */
export function adaptFavorites(raw: RawApiFavorite[]): Favorite[] {
  if (!Array.isArray(raw)) return []
  return raw.map(adaptFavorite)
}

/**
 * Adapt array of favorites with listings (filters out incomplete)
 */
export function adaptFavoritesWithListings(raw: RawApiFavorite[]): FavoriteWithListing[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(adaptFavoriteWithListing)
    .filter((f): f is FavoriteWithListing => f !== null)
}

/**
 * Create favorite for optimistic update
 */
export function createOptimisticFavorite(
  userId: string,
  listingId: string
): Favorite {
  return {
    id: `temp-${Date.now()}`,
    userId,
    listingId,
    createdAt: new Date().toISOString(),
  }
}

export default {
  adaptFavorite,
  adaptFavoriteWithListing,
  adaptFavorites,
  adaptFavoritesWithListings,
  createOptimisticFavorite,
}
