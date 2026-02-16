'use client'

/**
 * ТЗ-4: Геолокация при первом входе — автоопределение города.
 * Запускается 1 раз при загрузке. Только клиент (useEffect).
 * В Telegram mini-app гео не запрашиваем автоматически.
 */

import React, { useEffect, useState } from 'react'
import { useFilterStore } from '@/core/filters'

const USER_CITY_KEY = 'user_city'
const FILTER_STORAGE_KEY = 'locus_filter_state'
const GEO_TIMEOUT_MS = 6000
const DEFAULT_CITY = 'Москва'

function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean((window as unknown as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp)
}

function getSavedCityFromFilter(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { state?: { city?: string | null } }
    const city = data?.state?.city
    return city && typeof city === 'string' ? city : null
  } catch {
    return null
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ru' },
  })
  if (!res.ok) return null
  const data = (await res.json()) as {
    address?: {
      city?: string
      town?: string
      village?: string
      municipality?: string
      state?: string
      county?: string
    }
  }
  const a = data?.address
  if (!a) return null
  const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state ?? null
  return city ? String(city).trim() : null
}

export function GeoInit() {
  const [popup, setPopup] = useState<{ city: string } | null>(null)
  const setCity = useFilterStore((s) => s.setCity)

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator?.geolocation) return

    const saved = localStorage.getItem(USER_CITY_KEY)
    if (saved) return

    const fromFilter = getSavedCityFromFilter()
    if (fromFilter) {
      localStorage.setItem(USER_CITY_KEY, fromFilter)
      return
    }

    if (isTelegramWebApp()) return

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
      if (cancelled) return
      setCity(DEFAULT_CITY)
      localStorage.setItem(USER_CITY_KEY, DEFAULT_CITY)
    }, GEO_TIMEOUT_MS + 500)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (cancelled) return
        clearTimeoutIfSet()
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          const city = await reverseGeocode(lat, lng)
          if (cancelled) return
          if (city) {
            setPopup({ city })
          } else {
            setCity(DEFAULT_CITY)
            localStorage.setItem(USER_CITY_KEY, DEFAULT_CITY)
          }
        } catch {
          if (!cancelled) {
            setCity(DEFAULT_CITY)
            localStorage.setItem(USER_CITY_KEY, DEFAULT_CITY)
          }
        }
      },
      () => {
        if (cancelled) return
        clearTimeoutIfSet()
        setCity(DEFAULT_CITY)
        localStorage.setItem(USER_CITY_KEY, DEFAULT_CITY)
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 300000 }
    )

    return () => {
      cancelled = true
      clearTimeoutIfSet()
    }
  }, [setCity])

  const handleUse = (city: string) => {
    setCity(city)
    localStorage.setItem(USER_CITY_KEY, city)
    setPopup(null)
  }

  const handleChooseOther = () => {
    setPopup(null)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('locus-open-city-picker'))
    }
  }

  if (!popup) return null

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal,10000)] flex items-end justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:items-center md:p-0"
      aria-modal="true"
      role="dialog"
      aria-labelledby="geo-popup-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setPopup(null)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-xl">
        <h2 id="geo-popup-title" className="text-[16px] font-semibold text-[var(--text-main)] mb-1">
          Мы определили ваш город
        </h2>
        <p className="text-[14px] text-[var(--text-secondary)] mb-4">
          Ваш город: <strong>{popup.city}</strong>. Использовать?
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleChooseOther}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent text-[var(--text-main)] font-medium text-[14px] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Выбрать другой
          </button>
          <button
            type="button"
            onClick={() => handleUse(popup.city)}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-[14px] hover:opacity-95 transition-opacity"
          >
            Да
          </button>
        </div>
      </div>
    </div>
  )
}
