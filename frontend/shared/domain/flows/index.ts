/**
 * LOCUS User Flows
 * 
 * PATCH 5: User Flow Architecture
 * 
 * All business logic MUST go through flows.
 * ❌ No business logic in React components
 * ✅ Only through flows/services
 */

// Auth Flow
export type { AuthFlowState, AuthFlowEvent, AuthFlowContext } from './auth.flow'
export {
  initialAuthContext,
  authFlowReducer,
  canPerformAuthenticatedAction,
  isAuthInProgress,
  shouldShowLoginPrompt,
  shouldShowAuthError,
  getPostLoginRedirect,
} from './auth.flow'

// Listing Flow
export type {
  ListingViewState,
  ListingEditState,
  ListingSearchState,
  ListingFlowEvent,
  SearchQuery,
  ListingViewContext,
  ListingSearchContext,
  ListingEditContext,
} from './listing.flow'
export {
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
} from './listing.flow'

// Favorites Flow
export type {
  FavoritesFlowState,
  FavoriteActionState,
  FavoritesFlowEvent,
  FavoritesFlowContext,
} from './favorites.flow'
export {
  initialFavoritesContext,
  favoritesFlowReducer,
  isFavorited,
  isPendingAction,
  canAddFavorites,
  getFavoritesCount,
  shouldShowEmptyState,
} from './favorites.flow'

// Owner Flow
export type {
  OwnerDashboardState,
  ListingManageState,
  OwnerFlowEvent,
  OwnerDashboardContext,
  OwnerStats,
} from './owner.flow'
export {
  initialOwnerContext,
  ownerDashboardReducer,
  isOwner,
  canAccessDashboard,
  canPublishListing,
  getListingActionLabel,
} from './owner.flow'

// Product Flow (PATCH 6)
export type {
  ProductState,
  ProductStateContext,
  ProductTrigger,
  ProductRecommendation,
} from './product.flow'
export {
  resolveProductState,
  getProductStateContext,
  shouldShowCTA,
  shouldShowSignupPrompt,
  shouldShowPersonalized,
  getCTAText,
  getProgressPercentage,
  ProductFlow,
} from './product.flow'
