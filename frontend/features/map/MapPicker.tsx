'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './map.module.css'

const DEFAULT_CENTER: [number, number] = [61.25, 73.43]
const YANDEX_SCRIPT_URL = 'https://api-maps.yandex.ru/2.1/?apikey=%KEY%&lang=ru_RU'

export interface MapPickerChangeData {
  address: string
  lat: number
  lng: number
  city?: string
  street?: string
}

export interface MapPickerProps {
  onChange: (data: MapPickerChangeData) => void
  /** Начальный центр [lat, lng] при редактировании */
  initialCenter?: [number, number] | null
  /** Высота карты в px */
  height?: number
}

function getScriptUrl(): string {
  const key =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ||
        process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY ||
        ''
      : ''
  return YANDEX_SCRIPT_URL.replace('%KEY%', key)
}

export default function MapPicker({
  onChange,
  initialCenter = null,
  height = 300,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const placemarkRef = useRef<any>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const emitFromCoords = useCallback(
    async (ymaps: any, coords: number[]) => {
      try {
        const res = await ymaps.geocode(coords)
        const first = res.geoObjects.get(0)
        if (!first) return
        const address = first.getAddressLine?.() ?? ''
        const localities = first.getLocalities?.() ?? []
        const city = localities[0] ?? ''
        const street = first.getThoroughfare?.() ?? ''
        onChange({
          address,
          lat: coords[0],
          lng: coords[1],
          city: city || undefined,
          street: street || undefined,
        })
      } catch {
        onChange({
          address: '',
          lat: coords[0],
          lng: coords[1],
          city: undefined,
          street: undefined,
        })
      }
    },
    [onChange]
  )

  useEffect(() => {
    if (!scriptReady || !window.ymaps || !mapRef.current) return

    window.ymaps.ready(() => {
      const center = initialCenter && initialCenter.length === 2 ? initialCenter : DEFAULT_CENTER
      const map = new window.ymaps.Map(mapRef.current, {
        center,
        zoom: 12,
      })
      mapInstanceRef.current = map

      const placemark = new window.ymaps.Placemark(
        center,
        {},
        { draggable: true }
      )
      placemarkRef.current = placemark
      map.geoObjects.add(placemark)

      placemark.events.add('dragend', async () => {
        const coords = placemark.geometry.getCoordinates()
        await emitFromCoords(window.ymaps, coords)
      })

      map.events.add('click', async (e: any) => {
        const coords = e.get('coords')
        placemark.geometry.setCoordinates(coords)
        await emitFromCoords(window.ymaps, coords)
      })

      if (initialCenter && initialCenter.length === 2) {
        emitFromCoords(window.ymaps, initialCenter).catch(() => {})
      }
    })

    return () => {
      if (mapInstanceRef.current?.destroy) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
      placemarkRef.current = null
    }
  }, [scriptReady, initialCenter?.[0], initialCenter?.[1], emitFromCoords])

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim()
    if (!query || !window.ymaps || !mapInstanceRef.current || !placemarkRef.current) return
    try {
      const res = await window.ymaps.geocode(query)
      const first = res.geoObjects.get(0)
      if (!first) return
      const coords = first.geometry.getCoordinates()
      mapInstanceRef.current.setCenter(coords)
      placemarkRef.current.geometry.setCoordinates(coords)
      await emitFromCoords(window.ymaps, coords)
    } catch {
      /* ignore */
    }
  }, [searchQuery, emitFromCoords])

  const apiKey =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ||
        process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY
      : ''
  const scriptUrl = getScriptUrl()

  return (
    <>
      {apiKey && (
        <Script
          src={scriptUrl}
          strategy="lazyOnload"
          onLoad={() => setScriptReady(true)}
        />
      )}
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder="Введите адрес для поиска на карте"
        />
        <button type="button" className={styles.searchBtn} onClick={handleSearch}>
          Найти
        </button>
      </div>
      <div
        ref={mapRef}
        className={styles.wrapper}
        style={{ height: `${height}px` }}
      >
        {!apiKey && (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-[14px] px-4 text-center">
            Укажите NEXT_PUBLIC_YANDEX_MAPS_API_KEY для отображения карты
          </div>
        )}
      </div>
    </>
  )
}
