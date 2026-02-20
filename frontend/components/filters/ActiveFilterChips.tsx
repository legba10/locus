'use client'

/** TZ-29: Chips активных фильтров после применения — Москва ×, 2 комнаты ×, до 80k × */

import { useFilterStore } from '@/core/filters'
import { PROPERTY_TYPES } from '@/core/filters'
import { cn } from '@/shared/utils/cn'

function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

export function ActiveFilterChips({ className }: { className?: string }) {
  const { city, priceFrom, priceTo, type, rooms, setCity, setBudget, setTypeList, setRooms } = useFilterStore()

  const chips: { id: string; label: string; onRemove: () => void }[] = []

  if (city) {
    chips.push({ id: 'city', label: city, onRemove: () => setCity(null) })
  }
  if (priceFrom != null || priceTo != null) {
    const label = priceFrom != null && priceTo != null
      ? `${formatPrice(priceFrom)} – ${formatPrice(priceTo)} ₽`
      : priceFrom != null
        ? `от ${formatPrice(priceFrom)} ₽`
        : `до ${formatPrice(priceTo!)} ₽`
    chips.push({ id: 'budget', label, onRemove: () => setBudget('', '') })
  }
  if (Array.isArray(rooms) && rooms.length > 0) {
    const r = rooms[0]
    chips.push({ id: 'rooms', label: r === 4 ? '4+ комнат' : `${r} ${r === 1 ? 'комната' : 'комнаты'}`, onRemove: () => setRooms('') })
  }
  if (Array.isArray(type) && type.length > 0) {
    const labels = type.map((v) => PROPERTY_TYPES.find((t) => t.value === v)?.label ?? v).join(', ')
    chips.push({ id: 'type', label: labels, onRemove: () => setTypeList([]) })
  }

  if (chips.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1.5 text-[13px] font-medium"
        >
          <span className="max-w-[120px] truncate">{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="shrink-0 w-5 h-5 rounded-full hover:bg-[var(--accent)]/20 flex items-center justify-center"
            aria-label={`Убрать ${chip.label}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
