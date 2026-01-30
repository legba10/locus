/**
 * LOCUS Auth Module
 * 
 * ARCHITECTURE LOCK:
 * Central auth exports. Use these, not direct supabase access.
 * 
 * PATCH 4: Auth Hardening
 * - Singleton guard
 * - Request queue
 * - Timeout control
 */

export type { AuthState, AuthEvent, IAuthService } from './auth.service'
export { initialAuthState, getNextState, canTransition } from './auth.service'

// Guards (PATCH 4)
export {
  authSingletonGuard,
  startAuthInit,
  completeAuthInit,
  resetAuthState,
  queueAuthMeRequest,
  withAuthTimeout,
  withAuthRetry,
  getAuthStatus,
} from './auth.guards'

// Role Guards (PATCH 5)
export type { ExtendedRole, RoleGuardResult } from './role.guard'
export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasRoleAtLeast,
  isAuthenticated,
  isOwner,
  isAdmin,
  isRegularUser,
  getHighestRole,
  getRoleDisplayName,
  createRoleGuard,
  normalizeRole,
} from './role.guard'
