'use client'

import { useEffect, useMemo, useState } from 'react'
import { CityInput } from '@/shared/components/CityInput'
import { cn } from '@/shared/utils/cn'
import { buildMapQuery, buildYandexMapsEmbed, fetchYandexSuggestions } from '../mapController'

interface AddressStepProps {
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
  'w-full rounded-[12px] px-4 py-3 text-[14px]',
  'bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
  'border border-[var(--border-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30'
)

export function AddressStep(props: AddressStepProps) {
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([])
  const [houseSuggestions, setHouseSuggestions] = useState<string[]>([])
  const [streetOpen, setStreetOpen] = useState(false)
  const [houseOpen, setHouseOpen] = useState(false)
  const geocoderApiKey = process.env.NEXT_PUBLIC_YANDEX_GEOCODER_API_KEY

  const canStreet = props.city.trim().length > 0
  const canHouse = canStreet && props.street.trim().length > 0

  useEffect(() => {
    if (!canStreet && props.street) props.onStreetChange('')
    if (!canHouse && props.building) props.onBuildingChange('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStreet, canHouse])

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const query = `${props.city}, ${props.street}`
      const result = await fetchYandexSuggestions(geocoderApiKey, query, 'street')
      setStreetSuggestions(result)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [props.city, props.street, geocoderApiKey])

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const query = `${props.city}, ${props.street}, ${props.building}`
      const result = await fetchYandexSuggestions(geocoderApiKey, query, 'house')
      setHouseSuggestions(result)
    }, 200)
    return () => window.clearTimeout(timer)
  }, [props.city, props.street, props.building, geocoderApiKey])

  const mapQuery = useMemo(
    () => buildMapQuery([props.city, props.district, props.street, props.building]),
    [props.city, props.district, props.street, props.building]
  )
  const embedSrc = useMemo(() => buildYandexMapsEmbed(mapQuery), [mapQuery])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Город</label>
        <CityInput value={props.city} onChange={props.onCityChange} className={inputCls} />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Район</label>
        <input
          value={props.district}
          onChange={(e) => props.onDistrictChange(e.target.value)}
          className={inputCls}
          placeholder="Район"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Улица</label>
        <div className="relative">
          <input
            value={props.street}
            onChange={(e) => {
              props.onStreetChange(e.target.value)
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
                    props.onStreetChange(item)
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
            value={props.building}
            onChange={(e) => {
              props.onBuildingChange(e.target.value)
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
                    props.onBuildingChange(item)
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

      {props.street && (
        <div className="inline-flex items-center rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-1 text-[12px] font-semibold text-[var(--accent)]">
          Подсвеченная улица: {props.street}
        </div>
      )}

      <div className="rounded-[12px] overflow-hidden border border-[var(--border-main)] bg-[var(--bg-input)] h-48">
        {embedSrc ? (
          <iframe title="map-preview" src={embedSrc} className="w-full h-full border-0" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[13px] text-[var(--text-muted)]">
            Укажите адрес для отображения пина на карте
          </div>
        )}
      </div>
    </div>
  )
}
