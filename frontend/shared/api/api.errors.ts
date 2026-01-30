/**
 * LOCUS API Error System
 * 
 * PATCH 4: API Stability Layer
 * 
 * Provides:
 * - Error taxonomy
 * - Error class hierarchy
 * - Error mapping
 * - User-friendly messages
 */

/**
 * API Error codes taxonomy
 */
export type ApiErrorCode =
  // Auth
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID'
  | 'AUTH_EXPIRED'
  | 'AUTH_FORBIDDEN'
  
  // Resource
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'GONE'
  
  // Validation
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'MISSING_FIELD'
  
  // Media
  | 'MEDIA_ERROR'
  | 'MEDIA_NOT_FOUND'
  | 'MEDIA_UPLOAD_FAILED'
  | 'MEDIA_INVALID_TYPE'
  
  // Server
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  
  // Network
  | 'NETWORK_ERROR'
  | 'CONNECTION_REFUSED'
  
  // Unknown
  | 'UNKNOWN'

/**
 * Error severity levels
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

/**
 * API Error class
 */
export class ApiError extends Error {
  code: ApiErrorCode
  status: number
  details?: unknown
  severity: ErrorSeverity
  retryable: boolean

  constructor(
    message: string,
    code: ApiErrorCode = 'UNKNOWN',
    status: number = 500,
    details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
    this.severity = getSeverityFromCode(code)
    this.retryable = isRetryableCode(code)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
    }
  }
}

/**
 * Error messages for user display
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  // Auth
  AUTH_REQUIRED: 'Требуется авторизация',
  AUTH_INVALID: 'Неверные учётные данные',
  AUTH_EXPIRED: 'Сессия истекла, войдите снова',
  AUTH_FORBIDDEN: 'Доступ запрещён',
  
  // Resource
  NOT_FOUND: 'Не найдено',
  CONFLICT: 'Конфликт данных',
  GONE: 'Ресурс удалён',
  
  // Validation
  VALIDATION_ERROR: 'Ошибка валидации',
  INVALID_INPUT: 'Некорректные данные',
  MISSING_FIELD: 'Не заполнены обязательные поля',
  
  // Media
  MEDIA_ERROR: 'Ошибка загрузки медиа',
  MEDIA_NOT_FOUND: 'Файл не найден',
  MEDIA_UPLOAD_FAILED: 'Не удалось загрузить файл',
  MEDIA_INVALID_TYPE: 'Неподдерживаемый формат файла',
  
  // Server
  INTERNAL_ERROR: 'Внутренняя ошибка сервера',
  SERVICE_UNAVAILABLE: 'Сервис временно недоступен',
  TIMEOUT: 'Превышено время ожидания',
  RATE_LIMITED: 'Слишком много запросов, попробуйте позже',
  
  // Network
  NETWORK_ERROR: 'Ошибка сети',
  CONNECTION_REFUSED: 'Не удалось подключиться к серверу',
  
  // Unknown
  UNKNOWN: 'Произошла ошибка',
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: ApiErrorCode | string | undefined): string {
  if (code && code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[code as ApiErrorCode]
  }
  return ERROR_MESSAGES.UNKNOWN
}

/**
 * Map HTTP status to error code
 */
export function httpStatusToCode(status: number): ApiErrorCode {
  switch (status) {
    case 400: return 'VALIDATION_ERROR'
    case 401: return 'AUTH_REQUIRED'
    case 403: return 'AUTH_FORBIDDEN'
    case 404: return 'NOT_FOUND'
    case 409: return 'CONFLICT'
    case 410: return 'GONE'
    case 422: return 'INVALID_INPUT'
    case 429: return 'RATE_LIMITED'
    case 500: return 'INTERNAL_ERROR'
    case 502:
    case 503: return 'SERVICE_UNAVAILABLE'
    case 504: return 'TIMEOUT'
    default: return 'UNKNOWN'
  }
}

/**
 * Get severity from error code
 */
export function getSeverityFromCode(code: ApiErrorCode): ErrorSeverity {
  switch (code) {
    case 'AUTH_REQUIRED':
    case 'AUTH_EXPIRED':
      return 'info'
    
    case 'VALIDATION_ERROR':
    case 'INVALID_INPUT':
    case 'MISSING_FIELD':
    case 'NOT_FOUND':
    case 'RATE_LIMITED':
      return 'warning'
    
    case 'INTERNAL_ERROR':
    case 'SERVICE_UNAVAILABLE':
      return 'critical'
    
    default:
      return 'error'
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableCode(code: ApiErrorCode): boolean {
  return [
    'TIMEOUT',
    'NETWORK_ERROR',
    'SERVICE_UNAVAILABLE',
    'CONNECTION_REFUSED',
    'RATE_LIMITED',
  ].includes(code)
}

/**
 * Check if error requires re-auth
 */
export function requiresReauth(code: ApiErrorCode): boolean {
  return ['AUTH_REQUIRED', 'AUTH_EXPIRED', 'AUTH_INVALID'].includes(code)
}

/**
 * Create API error from response
 */
export function createApiError(
  response: Response,
  body?: { message?: string; error?: string; code?: string }
): ApiError {
  const code = (body?.code as ApiErrorCode) || httpStatusToCode(response.status)
  const message = body?.message || body?.error || getErrorMessage(code)
  
  return new ApiError(message, code, response.status, body)
}

export default {
  ApiError,
  ERROR_MESSAGES,
  getErrorMessage,
  httpStatusToCode,
  getSeverityFromCode,
  isRetryableCode,
  requiresReauth,
  createApiError,
}
