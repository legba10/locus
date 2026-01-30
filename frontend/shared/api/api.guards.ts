/**
 * LOCUS API Guards
 * 
 * PATCH 4: API Stability Layer
 * 
 * Provides:
 * - Request guards
 * - Response validation
 * - Retry logic
 * - Error handling
 */

import { logger } from '../utils/logger'
import { ApiError, createApiError, isRetryableCode, type ApiErrorCode } from './api.errors'
import type { ApiResponse } from './api.types'

// Configuration
const DEFAULT_TIMEOUT = 10000
const DEFAULT_RETRIES = 1
const RETRY_DELAY_BASE = 100

/**
 * Fetch options with guards
 */
export interface GuardedFetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  validateResponse?: boolean
}

/**
 * Guarded fetch - wraps fetch with timeout, retry, and error handling
 */
export async function guardedFetch(
  url: string,
  options: GuardedFetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      lastError = error as Error

      // Check if it's a timeout
      if (lastError.name === 'AbortError') {
        lastError = new ApiError(
          `Request timeout after ${timeout}ms`,
          'TIMEOUT',
          504
        )
      }

      // Check if retryable
      const code = (lastError as ApiError).code || 'UNKNOWN'
      if (!isRetryableCode(code as ApiErrorCode) || attempt === retries) {
        break
      }

      // Wait before retry
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
      logger.debug('API', `Retry ${attempt + 1} in ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
    }
  }

  throw lastError
}

/**
 * Parse and validate API response
 */
export async function parseApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  let body: any

  try {
    const text = await response.text()
    body = text ? JSON.parse(text) : {}
  } catch {
    body = {}
  }

  // If response follows our contract
  if (typeof body.ok === 'boolean') {
    return body as ApiResponse<T>
  }

  // Legacy response - wrap in contract
  if (response.ok) {
    return { ok: true, data: body }
  }

  // Error response
  const error = createApiError(response, body)
  return {
    ok: false,
    error: error.message,
    code: error.code,
  }
}

/**
 * Combined guarded fetch with parsing
 */
export async function safeFetch<T>(
  url: string,
  options: GuardedFetchOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await guardedFetch(url, options)
    return parseApiResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        error: error.message,
        code: error.code,
      }
    }
    return {
      ok: false,
      error: 'Network error',
      code: 'NETWORK_ERROR',
    }
  }
}

/**
 * Assert response is successful
 */
export function assertSuccess<T>(
  response: ApiResponse<T>,
  context?: string
): asserts response is ApiResponse<T> & { ok: true; data: T } {
  if (!response.ok) {
    const error = new ApiError(
      response.error || 'Request failed',
      (response.code as ApiErrorCode) || 'UNKNOWN'
    )
    if (context) {
      logger.error('API', `${context}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Unwrap response data or throw
 */
export function unwrapResponse<T>(
  response: ApiResponse<T>,
  context?: string
): T {
  assertSuccess(response, context)
  return response.data!
}

/**
 * Safe unwrap - returns default on error
 */
export function safeUnwrap<T>(
  response: ApiResponse<T>,
  defaultValue: T
): T {
  if (response.ok && response.data !== undefined) {
    return response.data
  }
  return defaultValue
}

export default {
  guardedFetch,
  parseApiResponse,
  safeFetch,
  assertSuccess,
  unwrapResponse,
  safeUnwrap,
}
