'use client'

import { useEffect, useMemo, useState } from 'react'
import { CityInput } from '@/shared/components/CityInput'
import { cn } from '@/shared/utils/cn'

export interface StepAddressProps {
  city: string
  district: string
  street: string
  building: string
  onCityChange: (v: string) => void
  onDistrictChange: (v: string) => void
  onStreetChange: (v: string) => void
  onBuildingChange: (v: string) => void
}

const inputCls = cn(
  'w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)]',
  'text-[#fff] placeholder:text-[#888] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'
)

export function StepAddress({
  city,
  district,
  street,
  building,
  onCityChange,
  onDistrictChange,
  onStreetChange,
  onBuildingChange,
}: StepAddressProps) {
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([])
  const [houseSuggestions, setHouseSuggestions] = useState<string[]>([])
  const [streetOpen, setStreetOpen] = useState(false)
  const [houseOpen, setHouseOpen] = useState(false)
  const geocoderApiKey = process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY
  const preview = [city, district].filter(Boolean).join(', ') || '—'
  const mapQuery = encodeURIComponent([city, district, street, building].filter(Boolean).join(', '))

  const canStreet = city.trim().length > 0
  const canHouse = canStreet && street.trim().length > 0

  useEffect(() => {
    if (!canStreet && street) onStreetChange('')
    if (!canHouse && building) onBuildingChange('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStreet, canHouse])

  useEffect(() => {
    if (!geocoderApiKey || !canStreet || street.trim().length < 2) {
      setStreetSuggestions([])
      return
    }
    const timer = window.setTimeout(async () => {
      try {
        const q = encodeURIComponent(`${city}, ${street}`)
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${encodeURIComponent(geocoderApiKey)}&format=json&results=6&geocode=${q}`
        const res = await fetch(url)
        const data = await res.json()
        const collection = data?.response?.GeoObjectCollection?.featureMember ?? []
        const parsed = collection
          .map((x: any) => String(x?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.formatted ?? ''))
          .filter(Boolean)
          .map((line: string) => line.split(',').slice(-2).join(',').trim())
        setStreetSuggestions(Array.from(new Set(parsed)).slice(0, 6))
      } catch {
        setStreetSuggestions([])
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [geocoderApiKey, canStreet, city, street])

  useEffect(() => {
    if (!geocoderApiKey || !canHouse || building.trim().length < 1) {
      setHouseSuggestions([])
      return
    }
    const timer = window.setTimeout(async () => {
      try {
        const q = encodeURIComponent(`${city}, ${street}, ${building}`)
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${encodeURIComponent(geocoderApiKey)}&format=json&results=6&geocode=${q}`
        const res = await fetch(url)
        const data = await res.json()
        const collection = data?.response?.GeoObjectCollection?.featureMember ?? []
        const parsed = collection
          .map((x: any) => String(x?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.formatted ?? ''))
          .filter(Boolean)
          .map((line: string) => line.split(',').pop()?.trim() ?? '')
          .filter(Boolean)
        setHouseSuggestions(Array.from(new Set(parsed)).slice(0, 6))
      } catch {
        setHouseSuggestions([])
      }
    }, 200)
    return () => window.clearTimeout(timer)
  }, [geocoderApiKey, canHouse, city, street, building])

  const mapHref = useMemo(() => {
    if (!mapQuery) return '#'
    return `https://yandex.ru/maps/?text=${mapQuery}`
  }, [mapQuery])

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Город</label>
        <CityInput value={city} onChange={onCityChange} className={inputCls} />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Район</label>
        <input value={district} onChange={(e) => onDistrictChange(e.target.value)} className={inputCls} placeholder="ЮАО" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Улица</label>
        <div className="relative">
          <input
            value={street}
            onChange={(e) => {
              onStreetChange(e.target.value)
              setStreetOpen(true)
            }}
            onFocus={() => setStreetOpen(true)}
            disabled={!canStreet}
            className={cn(inputCls, !canStreet && 'opacity-60 cursor-not-allowed')}
            placeholder={canStreet ? 'Начните вводить улицу' : 'Сначала выберите город'}
          />
          {streetOpen && streetSuggestions.length > 0 && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] shadow-lg max-h-52 overflow-y-auto">
              {streetSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="w-full text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  onClick={() => {
                    onStreetChange(item)
                    setStreetOpen(false)
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Дом</label>
        <div className="relative">
          <input
            value={building}
            onChange={(e) => {
              onBuildingChange(e.target.value)
              setHouseOpen(true)
            }}
            onFocus={() => setHouseOpen(true)}
            disabled={!canHouse}
            className={cn(inputCls, !canHouse && 'opacity-60 cursor-not-allowed')}
            placeholder={canHouse ? 'Номер дома' : 'Сначала выберите улицу'}
          />
          {houseOpen && houseSuggestions.length > 0 && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] shadow-lg max-h-52 overflow-y-auto">
              {houseSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="w-full text-left px-3 py-2 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  onClick={() => {
                    onBuildingChange(item)
                    setHouseOpen(false)
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-muted)] mb-2">Отображение</p>
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">{preview}</p>
      </div>
      <div className="rounded-[12px] h-40 bg-[var(--bg-input)] border border-[var(--border-main)] flex items-center justify-center">
        <a
          href={mapHref}
          target="_blank"
          rel="noreferrer"
          className="h-9 px-3 rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[13px] font-medium text-[var(--text-primary)]"
        >
          Открыть карту (Yandex/Google)
        </a>
      </div>
    </div>
  )
}
