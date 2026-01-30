/**
 * LOCUS Unified API Response
 * 
 * Single format for all API responses:
 * - ok: boolean - success status
 * - data?: T - response data (on success)
 * - error?: string - error message (on failure)
 * 
 * Usage:
 *   // In API route
 *   return apiSuccess({ items: [] })
 *   return apiError('Not found', 404)
 * 
 *   // In frontend
 *   const result = await fetchApi<ListingsResponse>('/api/listings')
 *   if (result.ok) {
 *     console.log(result.data)
 *   } else {
 *     console.error(result.error)
 *   }
 */

import { NextResponse } from 'next/server'

/**
 * Unified API response type
 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  code?: string
}

/**
 * Create success response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { ok: true, data },
    { status }
  )
}

/**
 * Create error response
 */
export function apiError(
  error: string,
  status = 400,
  code?: string
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { ok: false, error, code },
    { status }
  )
}

/**
 * Error code mapping for user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  'UNAUTHORIZED': 'Требуется авторизация',
  'FORBIDDEN': 'Доступ запрещён',
  'NOT_FOUND': 'Не найдено',
  'VALIDATION_ERROR': 'Ошибка валидации',
  'INTERNAL_ERROR': 'Внутренняя ошибка сервера',
  'TIMEOUT': 'Превышено время ожидания',
  'NETWORK_ERROR': 'Ошибка сети',
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: string | undefined, fallback?: string): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code]
  }
  return fallback || 'Произошла ошибка'
}

/**
 * Parse API response (for frontend use)
 */
export async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const json = await response.json()
    
    // If response follows our format
    if (typeof json.ok === 'boolean') {
      return json as ApiResponse<T>
    }
    
    // Legacy format - wrap in our format
    if (response.ok) {
      return { ok: true, data: json }
    } else {
      return { 
        ok: false, 
        error: json.message || json.error || `Error: ${response.status}` 
      }
    }
  } catch {
    return { 
      ok: false, 
      error: `Failed to parse response: ${response.status}` 
    }
  }
}

export default {
  apiSuccess,
  apiError,
  parseApiResponse,
  getErrorMessage,
  ERROR_MESSAGES,
}
