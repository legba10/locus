/**
 * TZ-66: Централизованная модель ролей и прав (RBAC).
 * Единственный источник: роль и проверки через usePermissions().
 * В компонентах не проверять user.role / hasRole напрямую.
 */

export type UiRole = 'guest' | 'user' | 'landlord' | 'admin'

export interface PermissionsContext {
  /** Владелец объявления (для страницы объявления) — чтобы знать ownsThisListing */
  listingOwnerId?: string
}

export interface Permissions {
  role: UiRole
  isGuest: boolean
  isUser: boolean
  isLandlord: boolean
  isAdmin: boolean

  /** Может писать в чат */
  canWrite: boolean
  /** Может бронировать */
  canBook: boolean
  /** Может добавить в избранное */
  canFavorite: boolean
  /** Может создать объявление */
  canCreateListing: boolean

  /** Владелец текущего объявления или админ — редактировать, календарь, продвижение, аналитика */
  canEditListing: boolean
  /** Видит «Продвижение» / может продвигать */
  canPromote: boolean
  /** Модерация объявлений */
  canModerate: boolean
  /** Менять статус объявления (админ) */
  canChangeListingStatus: boolean
  /** Видит админ-панель */
  canSeeAdminPanel: boolean
  /** Видит «Мои объявления» */
  canSeeMyListings: boolean
  /** Видит «Финансы» */
  canSeeFinance: boolean
  /** Видит «Продвижение» в профиле */
  canSeePromo: boolean
  /** Видит «Аналитика» */
  canSeeAnalytics: boolean
}

export function resolveRole(
  user: { id?: string; role?: string; isAdmin?: boolean; listingUsed?: number } | null
): UiRole {
  if (!user?.id) return 'guest'
  if (user.role === 'admin' || (user as any).isAdmin === true) return 'admin'
  const hasListings = Number((user as any).listingUsed ?? 0) > 0
  if (user.role === 'landlord' || hasListings) return 'landlord'
  return 'user'
}

export function buildPermissions(
  user: { id?: string; role?: string; isAdmin?: boolean; listingUsed?: number } | null,
  context: PermissionsContext = {}
): Permissions {
  const role = resolveRole(user)
  const listingOwnerId = context.listingOwnerId
  const ownsThisListing = Boolean(
    user?.id && listingOwnerId && user.id === listingOwnerId
  )

  const isGuest = role === 'guest'
  const isUser = role === 'user'
  const isLandlord = role === 'landlord'
  const isAdmin = role === 'admin'

  return {
    role,
    isGuest,
    isUser,
    isLandlord,
    isAdmin,

    canWrite: !isGuest,
    canBook: !isGuest,
    canFavorite: !isGuest,
    canCreateListing: !isGuest,

    canEditListing: ownsThisListing && (isLandlord || isAdmin) || isAdmin,
    canPromote: isLandlord || isAdmin,
    canModerate: isAdmin,
    canChangeListingStatus: isAdmin,
    canSeeAdminPanel: isAdmin,

    canSeeMyListings: isLandlord || isAdmin,
    canSeeFinance: isLandlord || isAdmin,
    canSeePromo: isLandlord || isAdmin,
    canSeeAnalytics: isLandlord || isAdmin,
  }
}
