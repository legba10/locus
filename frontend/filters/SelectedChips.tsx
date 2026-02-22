'use client'

import { useMemo, useState, useCallback } from 'react'
import { useSearchStore } from '@/search/store'

interface Chip {
  id: string
  label: string
}

const CHIP_STYLE = 'min-h-[36px] inline-flex items-center gap-2 rounded-[20px] border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-[14px] py-2 text-[13px] text-[var(--accent)] transition-[opacity,transform] duration-200 ease-out'

export function SelectedChips({ onChange }: { onChange: () => void }) {
  const { filters, setFilter, setFilters } = useSearchStore()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const chips = useMemo<Chip[]>(() => {
    const items: Chip[] = []
    if (filters.city) items.push({ id: 'city', label: filters.city })
    if (filters.priceFrom != null || filters.priceTo != null) {
      const priceLabel =
        filters.priceFrom != null && filters.priceTo != null
          ? `${filters.priceFrom} - ${filters.priceTo}`
          : filters.priceFrom != null
            ? `от ${filters.priceFrom}`
            : `до ${filters.priceTo}`
      items.push({ id: 'price', label: `${priceLabel} ₽` })
    }
    if (filters.rooms != null) items.push({ id: 'rooms', label: `${filters.rooms}${filters.rooms >= 4 ? '+' : ''} комнаты` })
    if (filters.rentType) {
      const label = filters.rentType === 'daily' ? 'Посуточно' : filters.rentType === 'long' ? 'На месяц' : filters.rentType
      items.push({ id: 'rentType', label })
    }
    if (filters.type) items.push({ id: 'type', label: filters.type })
    if (filters.pets) items.push({ id: 'pets', label: 'С животными' })
    if (filters.guests != null) items.push({ id: 'guests', label: `${filters.guests} гостя` })
    if (filters.metro) items.push({ id: 'metro', label: `Метро: ${filters.metro}` })
    if (filters.district) items.push({ id: 'district', label: `Район: ${filters.district}` })
    return items
  }, [filters])

  const doRemove = useCallback((id: string) => {
    if (id === 'city') setFilter('city', null)
    if (id === 'price') setFilters({ priceFrom: null, priceTo: null })
    if (id === 'rooms') setFilter('rooms', null)
    if (id === 'rentType') setFilter('rentType', null)
    if (id === 'type') setFilter('type', null)
    if (id === 'pets') setFilter('pets', null)
    if (id === 'guests') setFilter('guests', null)
    if (id === 'metro') setFilter('metro', null)
    if (id === 'district') setFilter('district', null)
    onChange()
  }, [setFilter, setFilters, onChange])

  const removeChip = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      doRemove(id)
      setRemovingId(null)
    }, 200)
  }

  if (!chips.length) return null

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.id}
          className={`${CHIP_STYLE} ${removingId === chip.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        >
          {chip.label}
          <button type="button" onClick={() => removeChip(chip.id)} className="rounded-full p-1 hover:bg-[var(--accent)]/20 shrink-0" aria-label={`Удалить ${chip.label}`}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

