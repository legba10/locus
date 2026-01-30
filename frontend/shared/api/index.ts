/**
 * LOCUS API Module
 * 
 * ARCHITECTURE LOCK:
 * Central API exports. All API operations use these types.
 * 
 * PATCH 4: API Stability Layer
 * - Error taxonomy
 * - Guards with retry
 * - Safe response handling
 */

export type {
  ApiResponse,
  PaginatedResponse,
  ApiErrorCode as ApiErrorCodeLegacy,
  ListingsApiContract,
  AuthApiContract,
} from './api.types'

export {
  API_ERROR_MESSAGES,
  getApiErrorMessage,
  httpStatusToErrorCode,
  isApiResponse,
  createSuccessResponse,
  createErrorResponse,
} from './api.types'

// Errors (PATCH 4)
export type { ApiErrorCode, ErrorSeverity } from './api.errors'
export {
  ApiError,
  ERROR_MESSAGES,
  getErrorMessage,
  httpStatusToCode,
  getSeverityFromCode,
  isRetryableCode,
  requiresReauth,
  createApiError,
} from './api.errors'

// Guards (PATCH 4)
export type { GuardedFetchOptions } from './api.guards'
export {
  guardedFetch,
  parseApiResponse,
  safeFetch,
  assertSuccess,
  unwrapResponse,
  safeUnwrap,
} from './api.guards'

// Error UX (PATCH 5)
export type { ErrorContext, UserFriendlyError } from './error.map'
export {
  getUserFriendlyError,
  getErrorTitle,
  getErrorMessageText,
  isRetryableError,
  errorFromException,
} from './error.map'
