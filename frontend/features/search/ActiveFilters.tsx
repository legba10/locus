'use client'

import type { Filters } from './search.types'
import styles from './search.module.css'

interface ActiveFiltersProps {
  filters: Filters
  onRemove: (key: keyof Filters) => void
}

export default function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  const chips: { key: keyof Filters; label: string }[] = []
  if (filters.city) chips.push({ key: 'city', label: filters.city })
  if (filters.rooms != null) chips.push({ key: 'rooms', label: `${filters.rooms} комн.` })
  if (filters.priceMin != null) chips.push({ key: 'priceMin', label: `от ${filters.priceMin.toLocaleString('ru-RU')} ₽` })
  if (filters.priceMax != null) chips.push({ key: 'priceMax', label: `до ${filters.priceMax.toLocaleString('ru-RU')} ₽` })
  if (filters.rentType) chips.push({ key: 'rentType', label: filters.rentType === 'daily' ? 'Посуточно' : 'Долгосрочно' })

  if (chips.length === 0) return null

  return (
    <div className={styles.chips}>
      {chips.map(({ key, label }) => (
        <span key={key} className={styles.chip}>
          {label}
          <button
            type="button"
            className={styles.chipRemove}
            onClick={() => onRemove(key)}
            aria-label={`Убрать ${label}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
