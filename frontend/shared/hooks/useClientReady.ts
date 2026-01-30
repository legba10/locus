'use client'

/**
 * LOCUS Client Ready Hook
 * 
 * PATCH 4: Hydration Stability
 * 
 * Use this hook to safely render client-only content:
 * 
 * const isReady = useClientReady()
 * if (!isReady) return <Skeleton />
 * return <ClientOnlyComponent />
 */

import { useState, useEffect } from 'react'

/**
 * Hook that returns true only after client-side hydration is complete.
 * Prevents hydration mismatch for client-only content.
 */
export function useClientReady(): boolean {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  return isReady
}

/**
 * Hook that returns a value only after client-side hydration.
 * Useful for values that differ between server and client.
 * 
 * @param clientValue - Value to return on client
 * @param serverValue - Value to return on server (and initial render)
 */
export function useClientValue<T>(clientValue: T, serverValue: T): T {
  const isReady = useClientReady()
  return isReady ? clientValue : serverValue
}

/**
 * Hook that safely accesses window properties.
 * Returns undefined during SSR and initial render.
 */
export function useWindow(): Window | undefined {
  const [win, setWin] = useState<Window | undefined>(undefined)

  useEffect(() => {
    setWin(window)
  }, [])

  return win
}

/**
 * Hook for safe localStorage access with SSR support.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // Always start with initialValue to prevent hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  // Setter that also updates localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

/**
 * Hook that returns current timestamp only on client.
 * Prevents hydration mismatch from Date.now() differences.
 */
export function useClientTimestamp(): number | null {
  const [timestamp, setTimestamp] = useState<number | null>(null)

  useEffect(() => {
    setTimestamp(Date.now())
  }, [])

  return timestamp
}

export default useClientReady
