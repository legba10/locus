/**
 * LOCUS Auth Guards
 * 
 * PATCH 4: Auth System Hardening
 * 
 * Provides:
 * - Singleton initialization guard
 * - Request queue for /auth/me
 * - Timeout control
 * - Race condition prevention
 */

import { logger } from '../utils/logger'

// Configuration
const AUTH_TIMEOUT_MS = 3000
const MAX_RETRIES = 1

/**
 * Singleton guard state
 */
let isInitializing = false
let isInitialized = false
let initPromise: Promise<void> | null = null

/**
 * Request queue for /auth/me
 * Only one request at a time, others wait for result
 */
let authMePromise: Promise<unknown> | null = null
let authMeResolvers: Array<{
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
}> = []

/**
 * Singleton guard - prevents multiple auth initializations
 */
export function authSingletonGuard(): { 
  canInit: boolean
  waitForInit: () => Promise<void>
} {
  if (isInitialized) {
    logger.debug('Auth', 'Already initialized, skipping')
    return { 
      canInit: false, 
      waitForInit: () => Promise.resolve() 
    }
  }

  if (isInitializing && initPromise) {
    logger.debug('Auth', 'Initialization in progress, waiting')
    return { 
      canInit: false, 
      waitForInit: () => initPromise! 
    }
  }

  return { 
    canInit: true, 
    waitForInit: () => Promise.resolve() 
  }
}

/**
 * Mark initialization as started
 */
export function startAuthInit(): void {
  isInitializing = true
  initPromise = new Promise((resolve) => {
    // Store resolver to call when init completes
    (initPromise as any)._resolve = resolve
  })
}

/**
 * Mark initialization as completed
 */
export function completeAuthInit(): void {
  isInitializing = false
  isInitialized = true
  if (initPromise && (initPromise as any)._resolve) {
    (initPromise as any)._resolve()
  }
  initPromise = null
}

/**
 * Reset auth state (for logout)
 */
export function resetAuthState(): void {
  isInitializing = false
  isInitialized = false
  initPromise = null
  authMePromise = null
  authMeResolvers = []
}

/**
 * Queue auth/me request - prevents duplicate requests
 * If a request is in progress, returns the same promise
 */
export function queueAuthMeRequest<T>(
  fetchFn: () => Promise<T>
): Promise<T> {
  // If request in progress, queue this one
  if (authMePromise) {
    logger.debug('Auth', 'Request in progress, queueing')
    return new Promise<T>((resolve, reject) => {
      authMeResolvers.push({ 
        resolve: resolve as (v: unknown) => void, 
        reject 
      })
    })
  }

  // Start new request
  logger.debug('Auth', 'Starting auth/me request')
  authMePromise = fetchFn()
    .then((result) => {
      // Resolve all queued promises
      authMeResolvers.forEach(({ resolve }) => resolve(result))
      authMeResolvers = []
      authMePromise = null
      return result
    })
    .catch((error) => {
      // Reject all queued promises
      authMeResolvers.forEach(({ reject }) => reject(error))
      authMeResolvers = []
      authMePromise = null
      throw error
    })

  return authMePromise as Promise<T>
}

/**
 * Create a fetch with timeout
 */
export function withAuthTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = AUTH_TIMEOUT_MS
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Auth timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

/**
 * Retry wrapper for auth operations
 */
export async function withAuthRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      logger.warn('Auth', `Attempt ${attempt + 1} failed`, error)
      
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError
}

/**
 * Get auth initialization status
 */
export function getAuthStatus(): {
  isInitializing: boolean
  isInitialized: boolean
  hasPendingRequest: boolean
} {
  return {
    isInitializing,
    isInitialized,
    hasPendingRequest: authMePromise !== null,
  }
}

export default {
  authSingletonGuard,
  startAuthInit,
  completeAuthInit,
  resetAuthState,
  queueAuthMeRequest,
  withAuthTimeout,
  withAuthRetry,
  getAuthStatus,
}
