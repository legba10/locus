/**
 * LOCUS Error UX Mapping
 * 
 * PATCH 5: Real Error UX
 * 
 * Maps technical errors to user-friendly messages.
 * Use instead of showing raw error messages.
 */

import type { ApiErrorCode } from './api.errors'

/**
 * Error context for better messages
 */
export type ErrorContext =
  | 'auth'
  | 'listing'
  | 'favorite'
  | 'media'
  | 'search'
  | 'profile'
  | 'general'

/**
 * User-friendly error
 */
export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  actionLabel?: string
  canRetry: boolean
  showSupport: boolean
}

/**
 * Generic error messages by code
 */
const GENERIC_MESSAGES: Record<ApiErrorCode | string, UserFriendlyError> = {
  // Auth errors
  AUTH_REQUIRED: {
    title: 'Требуется вход',
    message: 'Войдите в аккаунт, чтобы продолжить',
    action: '/auth/login',
    actionLabel: 'Войти',
    canRetry: false,
    showSupport: false,
  },
  AUTH_INVALID: {
    title: 'Неверные данные',
    message: 'Проверьте email и пароль',
    canRetry: true,
    showSupport: false,
  },
  AUTH_EXPIRED: {
    title: 'Сессия истекла',
    message: 'Войдите в аккаунт снова',
    action: '/auth/login',
    actionLabel: 'Войти',
    canRetry: false,
    showSupport: false,
  },
  AUTH_FORBIDDEN: {
    title: 'Доступ запрещён',
    message: 'У вас нет доступа к этому разделу',
    canRetry: false,
    showSupport: true,
  },

  // Resource errors
  NOT_FOUND: {
    title: 'Не найдено',
    message: 'Запрашиваемая страница не существует',
    action: '/',
    actionLabel: 'На главную',
    canRetry: false,
    showSupport: false,
  },
  CONFLICT: {
    title: 'Конфликт данных',
    message: 'Данные были изменены. Обновите страницу',
    canRetry: true,
    showSupport: false,
  },

  // Validation errors
  VALIDATION_ERROR: {
    title: 'Ошибка валидации',
    message: 'Проверьте правильность заполнения формы',
    canRetry: true,
    showSupport: false,
  },
  INVALID_INPUT: {
    title: 'Некорректные данные',
    message: 'Проверьте введённые данные',
    canRetry: true,
    showSupport: false,
  },
  MISSING_FIELD: {
    title: 'Не заполнены поля',
    message: 'Заполните все обязательные поля',
    canRetry: true,
    showSupport: false,
  },

  // Media errors
  MEDIA_ERROR: {
    title: 'Ошибка загрузки',
    message: 'Не удалось загрузить фото',
    canRetry: true,
    showSupport: false,
  },
  MEDIA_NOT_FOUND: {
    title: 'Фото не найдено',
    message: 'Изображение недоступно',
    canRetry: false,
    showSupport: false,
  },
  MEDIA_UPLOAD_FAILED: {
    title: 'Ошибка загрузки',
    message: 'Не удалось загрузить файл. Попробуйте другой формат',
    canRetry: true,
    showSupport: false,
  },
  MEDIA_INVALID_TYPE: {
    title: 'Неверный формат',
    message: 'Поддерживаются только JPG, PNG и WebP',
    canRetry: false,
    showSupport: false,
  },

  // Server errors
  INTERNAL_ERROR: {
    title: 'Ошибка сервера',
    message: 'Произошла ошибка. Мы уже работаем над её устранением',
    canRetry: true,
    showSupport: true,
  },
  SERVICE_UNAVAILABLE: {
    title: 'Сервис недоступен',
    message: 'Технические работы. Попробуйте через несколько минут',
    canRetry: true,
    showSupport: false,
  },
  TIMEOUT: {
    title: 'Превышено время ожидания',
    message: 'Сервер не отвечает. Попробуйте позже',
    canRetry: true,
    showSupport: false,
  },
  RATE_LIMITED: {
    title: 'Слишком много запросов',
    message: 'Подождите немного и попробуйте снова',
    canRetry: true,
    showSupport: false,
  },

  // Network errors
  NETWORK_ERROR: {
    title: 'Нет соединения',
    message: 'Проверьте подключение к интернету',
    canRetry: true,
    showSupport: false,
  },
  CONNECTION_REFUSED: {
    title: 'Сервер недоступен',
    message: 'Не удалось подключиться к серверу',
    canRetry: true,
    showSupport: true,
  },

  // Unknown
  UNKNOWN: {
    title: 'Что-то пошло не так',
    message: 'Произошла непредвиденная ошибка',
    canRetry: true,
    showSupport: true,
  },
}

/**
 * Context-specific overrides
 */
const CONTEXT_OVERRIDES: Partial<Record<ErrorContext, Partial<Record<string, Partial<UserFriendlyError>>>>> = {
  listing: {
    NOT_FOUND: {
      title: 'Объявление не найдено',
      message: 'Возможно, оно было удалено или снято с публикации',
      action: '/listings',
      actionLabel: 'К объявлениям',
    },
  },
  favorite: {
    AUTH_REQUIRED: {
      message: 'Войдите, чтобы добавлять в избранное',
    },
  },
  search: {
    NOT_FOUND: {
      title: 'Ничего не найдено',
      message: 'Попробуйте изменить параметры поиска',
      canRetry: false,
    },
  },
  profile: {
    AUTH_REQUIRED: {
      message: 'Войдите, чтобы просмотреть профиль',
    },
  },
}

/**
 * Get user-friendly error
 */
export function getUserFriendlyError(
  code: ApiErrorCode | string = 'UNKNOWN',
  context: ErrorContext = 'general'
): UserFriendlyError {
  // Get base error
  const base = GENERIC_MESSAGES[code] || GENERIC_MESSAGES.UNKNOWN
  
  // Apply context overrides
  const override = CONTEXT_OVERRIDES[context]?.[code]
  if (override) {
    return { ...base, ...override }
  }
  
  return base
}

/**
 * Get error title only
 */
export function getErrorTitle(
  code: ApiErrorCode | string = 'UNKNOWN'
): string {
  return (GENERIC_MESSAGES[code] || GENERIC_MESSAGES.UNKNOWN).title
}

/**
 * Get error message only
 */
export function getErrorMessageText(
  code: ApiErrorCode | string = 'UNKNOWN',
  context: ErrorContext = 'general'
): string {
  const error = getUserFriendlyError(code, context)
  return error.message
}

/**
 * Check if error is retryable
 */
export function isRetryableError(code: ApiErrorCode | string = 'UNKNOWN'): boolean {
  return (GENERIC_MESSAGES[code] || GENERIC_MESSAGES.UNKNOWN).canRetry
}

/**
 * Create error from exception
 */
export function errorFromException(
  error: unknown,
  context: ErrorContext = 'general'
): UserFriendlyError {
  if (error instanceof Error) {
    // Check for common patterns
    if (error.message.includes('fetch')) {
      return getUserFriendlyError('NETWORK_ERROR', context)
    }
    if (error.message.includes('timeout')) {
      return getUserFriendlyError('TIMEOUT', context)
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return getUserFriendlyError('AUTH_REQUIRED', context)
    }
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return getUserFriendlyError('NOT_FOUND', context)
    }
  }
  
  return getUserFriendlyError('UNKNOWN', context)
}

export default {
  getUserFriendlyError,
  getErrorTitle,
  getErrorMessageText,
  isRetryableError,
  errorFromException,
}
