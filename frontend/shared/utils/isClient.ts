/**
 * LOCUS SSR Safety Utilities
 * 
 * PATCH 4: Hydration Stability
 * 
 * Use these utilities to prevent hydration mismatch:
 * - isClient() — check if running in browser
 * - isServer() — check if running on server
 * - safeWindow() — safe window access
 * - safeLocalStorage() — safe localStorage access
 */

/**
 * Check if code is running in browser (client-side)
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Check if code is running on server (SSR)
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}

/**
 * Safe window access — returns undefined on server
 */
export function safeWindow(): Window | undefined {
  return isClient() ? window : undefined
}

/**
 * Safe document access — returns undefined on server
 */
export function safeDocument(): Document | undefined {
  return isClient() ? document : undefined
}

/**
 * Safe localStorage access
 * Returns null-safe wrapper on server
 */
export function safeLocalStorage(): Storage | null {
  if (!isClient()) return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Safe sessionStorage access
 */
export function safeSessionStorage(): Storage | null {
  if (!isClient()) return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/**
 * Get value from localStorage safely
 */
export function getLocalStorageItem(key: string): string | null {
  const storage = safeLocalStorage()
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Set value in localStorage safely
 */
export function setLocalStorageItem(key: string, value: string): boolean {
  const storage = safeLocalStorage()
  if (!storage) return false
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Remove value from localStorage safely
 */
export function removeLocalStorageItem(key: string): boolean {
  const storage = safeLocalStorage()
  if (!storage) return false
  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * SSR-safe JSON parse from localStorage
 */
export function getLocalStorageJSON<T>(key: string, defaultValue: T): T {
  const item = getLocalStorageItem(key)
  if (!item) return defaultValue
  try {
    return JSON.parse(item) as T
  } catch {
    return defaultValue
  }
}

/**
 * SSR-safe JSON stringify to localStorage
 */
export function setLocalStorageJSON<T>(key: string, value: T): boolean {
  try {
    return setLocalStorageItem(key, JSON.stringify(value))
  } catch {
    return false
  }
}

export default {
  isClient,
  isServer,
  safeWindow,
  safeDocument,
  safeLocalStorage,
  safeSessionStorage,
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  getLocalStorageJSON,
  setLocalStorageJSON,
}
