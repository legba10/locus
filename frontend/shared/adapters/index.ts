/**
 * LOCUS Adapters
 * 
 * ARCHITECTURE LOCK:
 * All adapters for converting external data to domain models.
 * 
 * PATCH 5: Added favorites adapter
 */

// Listing
export type { RawApiListing } from './listing.adapter'
export {
  adaptListing,
  adaptListingCard,
  adaptListings,
  adaptListingCards,
} from './listing.adapter'

// Favorite (PATCH 5)
export type { RawApiFavorite } from './favorite.adapter'
export {
  adaptFavorite,
  adaptFavoriteWithListing,
  adaptFavorites,
  adaptFavoritesWithListings,
  createOptimisticFavorite,
} from './favorite.adapter'
