'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'city'
const FALLBACK_CITY = 'Москва'
const GEO_TIMEOUT_MS = 8000

interface ReverseGeocodeResponse {
  city?: string
  locality?: string
  principalSubdivision?: string
}

export interface UseUserCityResult {
  city: string
  isPending: boolean
  geoDenied: boolean
  requestGeoAgain: () => void
  onChooseManual: () => void
  dismissDeniedModal: () => void
}

function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean((window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp)
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ru`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as ReverseGeocodeResponse
  const city = data.city ?? data.locality ?? data.principalSubdivision ?? null
  return city ? String(city).trim() : null
}

export function useUserCity(onCityDetected?: (city: string) => void): UseUserCityResult {
  const [city, setCity] = useState<string>(() => {
    if (typeof window === 'undefined') return FALLBACK_CITY
    return localStorage.getItem(STORAGE_KEY) || FALLBACK_CITY
  })
  const [isPending, setIsPending] = useState(false)
  const [geoDenied, setGeoDenied] = useState(false)
  const [runGeo, setRunGeo] = useState(false)

  const applyCity = useCallback(
    (detected: string) => {
      const value = detected || FALLBACK_CITY
      setCity(value)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, value)
      }
      onCityDetected?.(value)
    },
    [onCityDetected]
  )

  const requestGeo = useCallback(() => {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      applyCity(FALLBACK_CITY)
      return
    }
    setGeoDenied(false)
    setIsPending(true)
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const clearTimeoutIfSet = () => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = null
      if (!cancelled) {
        setIsPending(false)
        setGeoDenied(true)
        applyCity(FALLBACK_CITY)
      }
    }, GEO_TIMEOUT_MS + 1000)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return
        clearTimeoutIfSet()
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          const detectedCity = await reverseGeocode(lat, lng)
          if (!cancelled) {
            setIsPending(false)
            if (detectedCity) {
              applyCity(detectedCity)
            } else {
              applyCity(FALLBACK_CITY)
            }
          }
        } catch {
          if (!cancelled) {
            setIsPending(false)
            applyCity(FALLBACK_CITY)
          }
        }
      },
      () => {
        if (cancelled) return
        clearTimeoutIfSet()
        setIsPending(false)
        setGeoDenied(true)
        applyCity(FALLBACK_CITY)
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 300000 }
    )

    return () => {
      cancelled = true
      clearTimeoutIfSet()
    }
  }, [applyCity])

  const didRunGeo = useRef(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setCity(saved)
      return
    }
    if (isTelegramWebApp()) {
      setCity(FALLBACK_CITY)
      localStorage.setItem(STORAGE_KEY, FALLBACK_CITY)
      return
    }
    if (didRunGeo.current) return
    didRunGeo.current = true
    requestGeo()
  }, [requestGeo])

  const requestGeoAgain = useCallback(() => {
    setGeoDenied(false)
    requestGeo()
  }, [requestGeo])

  const onChooseManual = useCallback(() => {
    setGeoDenied(false)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('locus-open-city-picker'))
    }
  }, [])

  const dismissDeniedModal = useCallback(() => {
    setGeoDenied(false)
  }, [])

  return {
    city,
    isPending,
    geoDenied,
    requestGeoAgain,
    onChooseManual,
    dismissDeniedModal,
  }
}
