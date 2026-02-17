'use client'

/**
 * Жёсткое ТЗ (Проблема 4): геолокация через useUserCity (bigdatacloud), fallback Москва.
 * При отказе — модалка «Определить город автоматически? [Разрешить] [Выбрать вручную]».
 * Синхронизация города в filter store.
 */

import React, { useEffect } from 'react'
import { useFilterStore } from '@/core/filters'
import { useUserCity } from '@/hooks/useUserCity'

export function GeoInit() {
  const setCity = useFilterStore((s) => s.setCity)
  const storeCity = useFilterStore((s) => s.city)
  const {
    city: userCity,
    geoDenied,
    requestGeoAgain,
    onChooseManual,
    dismissDeniedModal,
  } = useUserCity((detected) => setCity(detected))

  useEffect(() => {
    if (!userCity) return
    if (storeCity === null || storeCity === '') {
      setCity(userCity)
    }
  }, [userCity, storeCity, setCity])

  if (!geoDenied) return null

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal,10000)] flex items-end justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:items-center md:p-0"
      aria-modal="true"
      role="dialog"
      aria-labelledby="geo-denied-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismissDeniedModal}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="geo-denied-title" className="text-[16px] font-semibold text-[var(--text-main)] mb-2">
          Определить город автоматически?
        </h2>
        <p className="text-[14px] text-[var(--text-secondary)] mb-4">
          Разрешите доступ к геолокации, чтобы подставлять ваш город в поиск, или выберите город вручную.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              onChooseManual()
              dismissDeniedModal()
            }}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent text-[var(--text-main)] font-medium text-[14px] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Выбрать вручную
          </button>
          <button
            type="button"
            onClick={() => {
              requestGeoAgain()
              dismissDeniedModal()
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] font-medium text-[14px] hover:opacity-95 transition-opacity"
          >
            Разрешить
          </button>
        </div>
      </div>
    </div>
  )
}
