'use client'

/** TZ-29: Chips активных фильтров после применения — Москва ×, 2 комнаты ×, до 80k × */

import { useFilterStore } from '@/core/filters'
import { buildActiveFilterChips } from '@/core/search'
import { cn } from '@/shared/utils/cn'

export function ActiveFilterChips({ className }: { className?: string }) {
  const store = useFilterStore()
  const chips = buildActiveFilterChips(store)

  if (chips.length === 0) return null

  const removeChip = (id: string) => {
    if (id === 'city') return store.setCity(null)
    if (id === 'budget') return store.setBudget('', '')
    if (id === 'rooms') return store.setRooms('')
    if (id === 'radius') return store.setRadius(2000)
    if (id === 'duration') return store.setDuration('')
    if (id.startsWith('type:')) {
      const typeKey = id.replace('type:', '')
      return store.setTypeList(store.type.filter((x) => x !== typeKey))
    }
  }

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
            onClick={() => removeChip(chip.id)}
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
