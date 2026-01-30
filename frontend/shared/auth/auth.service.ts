/**
 * LOCUS Auth Service
 * 
 * ARCHITECTURE LOCK:
 * Single entry point for all auth operations.
 * 
 * RULES:
 * - UI components MUST NOT access supabase directly
 * - All auth goes through this service
 * - State machine pattern for predictable flow
 */

import type { AuthStatus, User } from '../domain/user.model'
import { logger } from '../utils/logger'

/**
 * Auth state machine states
 */
export type AuthState = {
  status: AuthStatus
  user: User | null
  accessToken: string | null
  error: string | null
  isInitialized: boolean
}

/**
 * Auth events
 */
export type AuthEvent =
  | { type: 'INIT' }
  | { type: 'LOGIN'; email: string; password: string }
  | { type: 'REGISTER'; email: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH' }
  | { type: 'SESSION_LOADED'; user: User; token: string }
  | { type: 'SESSION_CLEARED' }
  | { type: 'ERROR'; error: string }

/**
 * State transition rules
 */
const transitions: Record<AuthStatus, AuthStatus[]> = {
  idle: ['loading'],
  loading: ['authenticated', 'anonymous', 'error'],
  authenticated: ['loading', 'anonymous'],
  anonymous: ['loading', 'authenticated'],
  error: ['loading', 'anonymous'],
}

/**
 * Check if transition is valid
 */
export function canTransition(from: AuthStatus, to: AuthStatus): boolean {
  return transitions[from]?.includes(to) ?? false
}

/**
 * Get next state based on event
 */
export function getNextState(state: AuthState, event: AuthEvent): AuthState {
  logger.debug('Auth', `Event: ${event.type}, Current: ${state.status}`)

  switch (event.type) {
    case 'INIT':
      if (state.isInitialized) {
        logger.debug('Auth', 'Already initialized, skipping')
        return state
      }
      if (!canTransition(state.status, 'loading')) {
        logger.warn('Auth', `Invalid transition: ${state.status} → loading`)
        return state
      }
      return { ...state, status: 'loading', error: null }

    case 'SESSION_LOADED':
      return {
        ...state,
        status: 'authenticated',
        user: event.user,
        accessToken: event.token,
        error: null,
        isInitialized: true,
      }

    case 'SESSION_CLEARED':
      return {
        ...state,
        status: 'anonymous',
        user: null,
        accessToken: null,
        error: null,
        isInitialized: true,
      }

    case 'LOGOUT':
      return {
        ...state,
        status: 'anonymous',
        user: null,
        accessToken: null,
        error: null,
      }

    case 'ERROR':
      return {
        ...state,
        status: 'error',
        error: event.error,
        isInitialized: true,
      }

    default:
      return state
  }
}

/**
 * Initial auth state
 */
export const initialAuthState: AuthState = {
  status: 'idle',
  user: null,
  accessToken: null,
  error: null,
  isInitialized: false,
}

/**
 * Auth service interface
 * Implemented by auth-store, exposed through this contract
 */
export interface IAuthService {
  // State
  getState(): AuthState
  subscribe(listener: (state: AuthState) => void): () => void
  
  // Actions
  initialize(): Promise<void>
  login(email: string, password: string): Promise<void>
  register(email: string, password: string): Promise<void>
  logout(): Promise<void>
  refresh(): Promise<boolean>
  
  // Selectors
  isAuthenticated(): boolean
  hasRole(role: string): boolean
  getUser(): User | null
  getToken(): string | null
}

export default {
  initialAuthState,
  getNextState,
  canTransition,
}
