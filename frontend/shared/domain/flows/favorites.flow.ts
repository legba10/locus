/**
 * LOCUS Favorites Flow
 * 
 * PATCH 5: User Flow Architecture
 * 
 * Defines favorites user flow states and transitions.
 * Business logic MUST go through this flow, NOT in React components.
 */

import type { ListingCard } from '../listing.model'
import type { User } from '../user.model'
import type { Favorite } from '../favorite.model'

/**
 * Favorites flow states
 */
export type FavoritesFlowState =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'empty'
  | 'error'

/**
 * Single favorite action states
 */
export type FavoriteActionState =
  | 'idle'
  | 'adding'
  | 'removing'
  | 'success'
  | 'error'

/**
 * Favorites flow events
 */
export type FavoritesFlowEvent =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; favorites: Favorite[] }
  | { type: 'LOAD_EMPTY' }
  | { type: 'LOAD_FAILURE'; error: string }
  | { type: 'ADD_START'; listingId: string }
  | { type: 'ADD_SUCCESS'; favorite: Favorite }
  | { type: 'ADD_FAILURE'; listingId: string; error: string }
  | { type: 'REMOVE_START'; listingId: string }
  | { type: 'REMOVE_SUCCESS'; listingId: string }
  | { type: 'REMOVE_FAILURE'; listingId: string; error: string }
  | { type: 'RESET' }

/**
 * Favorites flow context
 */
export interface FavoritesFlowContext {
  state: FavoritesFlowState
  favorites: Favorite[]
  favoriteIds: Set<string> // Quick lookup
  pendingActions: Map<string, FavoriteActionState>
  error: string | null
}

/**
 * Initial context
 */
export const initialFavoritesContext: FavoritesFlowContext = {
  state: 'idle',
  favorites: [],
  favoriteIds: new Set(),
  pendingActions: new Map(),
  error: null,
}

/**
 * Favorites flow reducer
 */
export function favoritesFlowReducer(
  context: FavoritesFlowContext,
  event: FavoritesFlowEvent
): FavoritesFlowContext {
  switch (event.type) {
    case 'LOAD_START':
      return { ...context, state: 'loading', error: null }

    case 'LOAD_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        favorites: event.favorites,
        favoriteIds: new Set(event.favorites.map(f => f.listingId)),
        error: null,
      }

    case 'LOAD_EMPTY':
      return {
        ...context,
        state: 'empty',
        favorites: [],
        favoriteIds: new Set(),
      }

    case 'LOAD_FAILURE':
      return { ...context, state: 'error', error: event.error }

    case 'ADD_START': {
      const newPending = new Map(context.pendingActions)
      newPending.set(event.listingId, 'adding')
      // Optimistic update
      const newIds = new Set(context.favoriteIds)
      newIds.add(event.listingId)
      return {
        ...context,
        favoriteIds: newIds,
        pendingActions: newPending,
      }
    }

    case 'ADD_SUCCESS': {
      const newPending = new Map(context.pendingActions)
      newPending.delete(event.favorite.listingId)
      return {
        ...context,
        state: 'loaded',
        favorites: [...context.favorites, event.favorite],
        favoriteIds: new Set([...context.favoriteIds, event.favorite.listingId]),
        pendingActions: newPending,
      }
    }

    case 'ADD_FAILURE': {
      const newPending = new Map(context.pendingActions)
      newPending.set(event.listingId, 'error')
      // Rollback optimistic update
      const newIds = new Set(context.favoriteIds)
      newIds.delete(event.listingId)
      return {
        ...context,
        favoriteIds: newIds,
        pendingActions: newPending,
        error: event.error,
      }
    }

    case 'REMOVE_START': {
      const newPending = new Map(context.pendingActions)
      newPending.set(event.listingId, 'removing')
      // Optimistic update
      const newIds = new Set(context.favoriteIds)
      newIds.delete(event.listingId)
      return {
        ...context,
        favoriteIds: newIds,
        pendingActions: newPending,
      }
    }

    case 'REMOVE_SUCCESS': {
      const newPending = new Map(context.pendingActions)
      newPending.delete(event.listingId)
      return {
        ...context,
        favorites: context.favorites.filter(f => f.listingId !== event.listingId),
        pendingActions: newPending,
      }
    }

    case 'REMOVE_FAILURE': {
      const newPending = new Map(context.pendingActions)
      newPending.set(event.listingId, 'error')
      // Rollback optimistic update
      const newIds = new Set(context.favoriteIds)
      newIds.add(event.listingId)
      return {
        ...context,
        favoriteIds: newIds,
        pendingActions: newPending,
        error: event.error,
      }
    }

    case 'RESET':
      return initialFavoritesContext

    default:
      return context
  }
}

/**
 * Check if listing is favorited
 */
export function isFavorited(context: FavoritesFlowContext, listingId: string): boolean {
  return context.favoriteIds.has(listingId)
}

/**
 * Check if action is pending for listing
 */
export function isPendingAction(context: FavoritesFlowContext, listingId: string): boolean {
  const action = context.pendingActions.get(listingId)
  return action === 'adding' || action === 'removing'
}

/**
 * Check if user can add favorites
 */
export function canAddFavorites(user: User | null): boolean {
  return user !== null
}

/**
 * Get favorites count
 */
export function getFavoritesCount(context: FavoritesFlowContext): number {
  return context.favorites.length
}

/**
 * Check if should show favorites empty state
 */
export function shouldShowEmptyState(context: FavoritesFlowContext): boolean {
  return context.state === 'empty' || 
    (context.state === 'loaded' && context.favorites.length === 0)
}

export default {
  initialFavoritesContext,
  favoritesFlowReducer,
  isFavorited,
  isPendingAction,
  canAddFavorites,
  getFavoritesCount,
  shouldShowEmptyState,
}
