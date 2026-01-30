import type { ApiErrorCode as ApiErrorCodeBase } from './api.errors'
import { ERROR_MESSAGES } from './api.errors'

/**
 * LOCUS API Contract
 * 
 * ARCHITECTURE LOCK:
 * Strict API response format. All APIs MUST follow this contract.
 */

/**
 * Standard API response
 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  code?: ApiErrorCode
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

/**
 * Error codes (shared with api.errors)
 */
export type ApiErrorCode = ApiErrorCodeBase

/**
 * Error messages for codes
 */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = ERROR_MESSAGES

/**
 * Get user-friendly error message
 */
export function getApiErrorMessage(code?: ApiErrorCode, fallback?: string): string {
  if (code && API_ERROR_MESSAGES[code]) {
    return API_ERROR_MESSAGES[code]
  }
  return fallback || API_ERROR_MESSAGES.UNKNOWN
}

/**
 * HTTP status to error code mapping
 */
export function httpStatusToErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 401: return 'AUTH_REQUIRED'
    case 403: return 'AUTH_FORBIDDEN'
    case 404: return 'NOT_FOUND'
    case 409: return 'CONFLICT'
    case 422: return 'VALIDATION_ERROR'
    case 429: return 'RATE_LIMITED'
    case 500: return 'INTERNAL_ERROR'
    case 504: return 'TIMEOUT'
    default: return 'UNKNOWN'
  }
}

/**
 * Type guard for ApiResponse
 */
export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ApiResponse).ok === 'boolean'
  )
}

/**
 * Helper to create success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { ok: true, data }
}

/**
 * Helper to create error response
 */
export function createErrorResponse(
  error: string,
  code?: ApiErrorCode
): ApiResponse<never> {
  return { ok: false, error, code }
}

/**
 * Listings API endpoints contract
 */
export interface ListingsApiContract {
  // GET /api/listings
  getListings: {
    request: {
      city?: string
      priceMin?: number
      priceMax?: number
      type?: string
      limit?: number
      offset?: number
    }
    response: PaginatedResponse<unknown> // Adapter converts to Listing[]
  }

  // GET /api/listings/:id
  getListing: {
    request: { id: string }
    response: ApiResponse<unknown> // Adapter converts to ListingDetail
  }

  // POST /api/listings
  createListing: {
    request: {
      title: string
      description?: string
      city: string
      price: number
      type?: string
    }
    response: ApiResponse<{ id: string }>
  }

  // POST /api/listings/:id/photos
  uploadPhoto: {
    request: FormData
    response: ApiResponse<{ url: string }>
  }
}

/**
 * Auth API endpoints contract
 */
export interface AuthApiContract {
  // GET /api/auth/me
  me: {
    response: ApiResponse<unknown> // Adapter converts to User
  }

  // POST /api/auth/login
  login: {
    request: { email: string; password: string }
    response: ApiResponse<{ user: unknown; token: string }>
  }

  // POST /api/auth/register
  register: {
    request: { email: string; password: string }
    response: ApiResponse<{ user: unknown; token: string }>
  }

  // POST /api/auth/logout
  logout: {
    response: ApiResponse<void>
  }
}
