export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

import { getApiUrl } from '@/shared/config/api'

/**
 * Simple GET request to backend API
 * Path should include /api/ prefix (e.g., "/api/listings")
 */
export async function apiGet<T>(path: string): Promise<T> {
  // Ensure path starts with /api/
  let normalizedPath = path
  if (!path.startsWith('/api/') && !path.startsWith('/api?')) {
    normalizedPath = path.startsWith('/') ? `/api${path}` : `/api/${path}`
  }
  
  const url = path.startsWith('http') ? path : getApiUrl(normalizedPath)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const text = await res.text()
    const payload = text ? (JSON.parse(text) as unknown) : undefined
    
    if (!res.ok) {
      throw new ApiError(`Request failed: ${res.status}`, res.status, payload)
    }
    
    return payload as T
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 504, undefined)
    }
    throw error
  }
}
