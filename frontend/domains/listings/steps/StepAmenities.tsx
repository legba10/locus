'use client'

import { cn } from '@/shared/utils/cn'
import { AMENITIES_MAP, amenityLabel } from '@/core/i18n/ru'

/** ТЗ-5: Удобства — чекбоксы по категориям. Базовые, кухня, комфорт, безопасность. */
const CATEGORIES: { key: string; label: string; keys: string[] }[] = [
  { key: 'base', label: 'Базовые', keys: ['wifi', 'washer', 'air_conditioner', 'kitchen', 'parking', 'balcony', 'tv', 'elevator'] },
  { key: 'kitchen', label: 'Кухня', keys: ['refrigerator', 'dishwasher', 'workspace'] },
  { key: 'comfort', label: 'Комфорт', keys: ['heating', 'iron', 'hair_dryer', 'workspace_desk'] },
  { key: 'safety', label: 'Безопасность', keys: ['first_aid', 'fire_extinguisher'] },
]

export interface StepAmenitiesProps {
  amenityKeys: string[]
  onChange: (keys: string[]) => void
}

export function StepAmenities({ amenityKeys, onChange }: StepAmenitiesProps) {
  const toggle = (key: string) => {
    if (amenityKeys.includes(key)) onChange(amenityKeys.filter((k) => k !== key))
    else onChange([...amenityKeys, key])
  }

  return (
    <div className="step-container space-y-6">
      {CATEGORIES.map((cat) => (
        <div key={cat.key}>
          <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-3">{cat.label}</p>
          <div className="grid grid-cols-2 gap-2">
            {cat.keys.map((key) => {
              const label = AMENITIES_MAP[key] ?? amenityLabel(key)
              const checked = amenityKeys.includes(key)
              return (
                <label
                  key={key}
                  className={cn(
                    'feature-card flex items-center gap-2 px-4 py-3 cursor-pointer',
                    checked && 'active'
                  )}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggle(key)} className="rounded border-[var(--border-main)] text-[var(--accent)] accent-[var(--accent)]" />
                  <span className="text-[14px] font-medium text-[var(--text-primary)]">{label}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
