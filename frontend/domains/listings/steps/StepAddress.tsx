'use client'

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
  'text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'
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
  const preview = [city, district].filter(Boolean).join(', ') || '—'

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Город</label>
        <CityInput value={city} onChange={onCityChange} />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Район</label>
        <input value={district} onChange={(e) => onDistrictChange(e.target.value)} className={inputCls} placeholder="ЮАО" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Улица</label>
        <input value={street} onChange={(e) => onStreetChange(e.target.value)} className={inputCls} placeholder="ул. Примерная" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Дом</label>
        <input value={building} onChange={(e) => onBuildingChange(e.target.value)} className={inputCls} placeholder="10" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-muted)] mb-2">Отображение</p>
        <p className="text-[15px] font-semibold text-[var(--text-primary)]">{preview}</p>
      </div>
      <div className="rounded-[12px] h-40 bg-[var(--bg-input)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] text-[14px]">
        Карта (превью)
      </div>
    </div>
  )
}
