/**
 * LOCUS Auth Flow
 * 
 * PATCH 5: User Flow Architecture
 * 
 * Defines authentication user flow states and transitions.
 * Business logic MUST go through this flow, NOT in React components.
 */

import type { User } from '../user.model'

/**
 * Auth flow states
 */
export type AuthFlowState =
  | 'anonymous'      // Not logged in
  | 'auth_loading'   // Checking auth status
  | 'authenticating' // Login/register in progress
  | 'authenticated'  // Logged in successfully
  | 'error'          // Auth failed

/**
 * Auth flow events
 */
export type AuthFlowEvent =
  | { type: 'INIT' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_FAILURE'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'TOKEN_REFRESH' }
  | { type: 'RETRY' }

/**
 * Auth flow context
 */
export interface AuthFlowContext {
  state: AuthFlowState
  user: User | null
  error: string | null
  lastAuthTime: string | null
  retryCount: number
}

/**
 * Initial auth flow context
 */
export const initialAuthContext: AuthFlowContext = {
  state: 'auth_loading',
  user: null,
  error: null,
  lastAuthTime: null,
  retryCount: 0,
}

/**
 * Auth flow state machine
 */
export function authFlowReducer(
  context: AuthFlowContext,
  event: AuthFlowEvent
): AuthFlowContext {
  switch (event.type) {
    case 'INIT':
      return {
        ...context,
        state: 'auth_loading',
        error: null,
      }

    case 'LOGIN_START':
      return {
        ...context,
        state: 'authenticating',
        error: null,
      }

    case 'LOGIN_SUCCESS':
      return {
        ...context,
        state: 'authenticated',
        user: event.user,
        error: null,
        lastAuthTime: new Date().toISOString(),
        retryCount: 0,
      }

    case 'LOGIN_FAILURE':
      return {
        ...context,
        state: 'error',
        error: event.error,
        retryCount: context.retryCount + 1,
      }

    case 'LOGOUT':
      return {
        ...initialAuthContext,
        state: 'anonymous',
      }

    case 'SESSION_EXPIRED':
      return {
        ...context,
        state: 'anonymous',
        user: null,
        error: 'Сессия истекла',
      }

    case 'RETRY':
      if (context.retryCount < 3) {
        return {
          ...context,
          state: 'auth_loading',
        }
      }
      return context

    default:
      return context
  }
}

/**
 * Check if user can perform authenticated action
 */
export function canPerformAuthenticatedAction(context: AuthFlowContext): boolean {
  return context.state === 'authenticated' && context.user !== null
}

/**
 * Check if auth is in progress
 */
export function isAuthInProgress(context: AuthFlowContext): boolean {
  return context.state === 'auth_loading' || context.state === 'authenticating'
}

/**
 * Check if should show login prompt
 */
export function shouldShowLoginPrompt(context: AuthFlowContext): boolean {
  return context.state === 'anonymous'
}

/**
 * Check if should show error
 */
export function shouldShowAuthError(context: AuthFlowContext): boolean {
  return context.state === 'error' && context.error !== null
}

/**
 * Get redirect path after login
 */
export function getPostLoginRedirect(
  context: AuthFlowContext,
  intendedPath?: string
): string {
  if (!context.user) return '/'
  
  // Owners go to dashboard by default
  if (context.user.roles.includes('landlord')) {
    return intendedPath || '/owner/dashboard'
  }
  
  return intendedPath || '/'
}

export default {
  initialAuthContext,
  authFlowReducer,
  canPerformAuthenticatedAction,
  isAuthInProgress,
  shouldShowLoginPrompt,
  shouldShowAuthError,
  getPostLoginRedirect,
}
