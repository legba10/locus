'use client'

import type { FilterState } from '@/core/filters'
import { PROPERTY_TYPES } from '@/core/filters'

export interface ActiveFilterChip {
  id: string
  label: string
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

export function buildActiveFilterChips(filters: FilterState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  if (filters.city) chips.push({ id: 'city', label: filters.city })
  if (filters.priceFrom != null || filters.priceTo != null) {
    const label =
      filters.priceFrom != null && filters.priceTo != null
        ? `${formatPrice(filters.priceFrom)}–${formatPrice(filters.priceTo)}`
        : filters.priceFrom != null
          ? `от ${formatPrice(filters.priceFrom)}`
          : `до ${formatPrice(filters.priceTo!)}`
    chips.push({ id: 'budget', label })
  }
  if (Array.isArray(filters.rooms) && filters.rooms.length > 0) {
    chips.push({ id: 'rooms', label: `${Math.max(...filters.rooms)}+` })
  }
  if (Array.isArray(filters.type) && filters.type.length > 0) {
    for (const t of filters.type) {
      const uiLabel = PROPERTY_TYPES.find((x) => x.value === t)?.label ?? t
      chips.push({ id: `type:${t}`, label: uiLabel })
    }
  }
  if (filters.radius > 0) {
    chips.push({ id: 'radius', label: `${Math.round(filters.radius / 1000)} км` })
  }
  if (filters.duration) {
    chips.push({ id: 'duration', label: filters.duration })
  }
  return chips
}

export function applyAutoExpand(filters: FilterState): FilterState {
  const next = { ...filters }
  if (next.priceTo != null) next.priceTo = Math.round(next.priceTo * 1.1)
  if (next.priceFrom != null) next.priceFrom = Math.round(next.priceFrom * 1.1)
  next.radius = Math.min(50000, next.radius + 3000)
  next.budgetMin = next.priceFrom ?? ''
  next.budgetMax = next.priceTo ?? ''
  return next
}
