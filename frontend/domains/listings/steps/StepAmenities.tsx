'use client'

import { cn } from '@/shared/utils/cn'
import { AMENITIES_MAP, amenityLabel } from '@/core/i18n/ru'
import { Check } from 'lucide-react'

/** TZ-63: Удобства — компактная сетка, блоки с паузой, галочка при выборе. */
const CATEGORIES: { key: string; label: string; keys: string[] }[] = [
  { key: 'base', label: 'Базовые', keys: ['wifi', 'tv', 'elevator', 'balcony', 'parking', 'air_conditioner', 'kitchen'] },
  { key: 'kitchen', label: 'Кухня', keys: ['refrigerator', 'dishwasher', 'workspace'] },
  { key: 'bathroom', label: 'Санузел', keys: ['washer', 'dryer', 'bathtub', 'shower', 'hair_dryer'] },
  { key: 'extra', label: 'Дополнительно', keys: ['heating', 'iron', 'first_aid', 'fire_extinguisher', 'workspace_desk'] },
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
    <div className="step-container step-amenities-tz63">
      {CATEGORIES.map((cat) => (
        <section key={cat.key} className="features-section">
          <h3 className="features-section__title">{cat.label}</h3>
          <div className="features-grid">
            {cat.keys.map((key) => {
              const label = AMENITIES_MAP[key] ?? amenityLabel(key)
              const checked = amenityKeys.includes(key)
              return (
                <label
                  key={key}
                  className={cn('feature-card', checked && 'active')}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(key)}
                    className="feature-card__input"
                  />
                  <span className="feature-card__label">{label}</span>
                  {checked && (
                    <span className="feature-card__check" aria-hidden>
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
