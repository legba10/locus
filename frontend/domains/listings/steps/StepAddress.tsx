'use client'

import { useMemo } from 'react'
import { cn } from '@/shared/utils/cn'
import MapPicker from '@/features/map/MapPicker'
import type { MapPickerChangeData } from '@/features/map/MapPicker'
import stepAddressStyles from './StepAddress.module.css'

export interface StepAddressProps {
  city: string
  district: string
  street: string
  building: string
  lat?: number | null
  lng?: number | null
  onCityChange: (v: string) => void
  onDistrictChange: (v: string) => void
  onStreetChange: (v: string) => void
  onBuildingChange: (v: string) => void
  onAddressDataChange?: (data: MapPickerChangeData) => void
}

const inputCls = cn(
  'w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)]',
  'text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 placeholder:text-[var(--text-secondary)]'
)

export function StepAddress({
  city,
  district,
  street,
  building,
  lat,
  lng,
  onCityChange,
  onDistrictChange,
  onStreetChange,
  onBuildingChange,
  onAddressDataChange,
}: StepAddressProps) {
  const preview = [city, district].filter(Boolean).join(', ') || '—'
  const initialCenter = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
    ? [lat, lng] as [number, number]
    : null

  const handleMapChange = useMemo(
    () => (data: MapPickerChangeData) => {
      onCityChange(data.city ?? '')
      onStreetChange(data.street ?? '')
      onAddressDataChange?.(data)
    },
    [onCityChange, onStreetChange, onAddressDataChange]
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-medium text-[var(--text-muted)] mb-2">
          Выберите адрес на карте или введите в поиск
        </p>
        <MapPicker
          initialCenter={initialCenter}
          height={300}
          onChange={handleMapChange}
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Город</label>
        <input
          value={city}
          readOnly
          className={cn(inputCls, stepAddressStyles.inputReadOnly, city && stepAddressStyles.filled)}
          placeholder="Выберите точку на карте"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Улица</label>
        <input
          value={street}
          readOnly
          className={cn(inputCls, stepAddressStyles.inputReadOnly, street && stepAddressStyles.filled)}
          placeholder="Определится по карте"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Район</label>
        <input
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          className={inputCls}
          placeholder="ЮАО (необязательно)"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Дом / корпус</label>
        <input
          value={building}
          onChange={(e) => onBuildingChange(e.target.value)}
          className={inputCls}
          placeholder="Номер дома (необязательно)"
        />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-muted)] mb-2">Отображение</p>
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">{preview}</p>
      </div>
    </div>
  )
}
