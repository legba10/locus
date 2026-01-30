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

export async function apiGet<T>(path: string): Promise<T> {
  // Add timeout to prevent hanging
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

  try {
    const res = await fetch(path, {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      cache: 'no-store',
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

