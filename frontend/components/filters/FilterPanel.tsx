'use client'

import { useFilterStore } from '@/core/filters'
import { PROPERTY_TYPES, DURATION_OPTIONS, ROOMS_OPTIONS } from '@/core/filters'
import { CitySelect } from './CitySelect'
import { BudgetRange } from './BudgetRange'
import { FilterChips } from './FilterChips'
import { AIModeSwitch } from './AIModeSwitch'
import { cn } from '@/shared/utils/cn'

export interface FilterPanelProps {
  onSearch?: () => void
  onSmartSearch?: () => void
  showSearchButtons?: boolean
  className?: string
  /** Встроенный режим (без обёртки колонки) */
  embedded?: boolean
}

export function FilterPanel({
  onSearch,
  onSmartSearch,
  showSearchButtons = true,
  className,
  embedded = false,
}: FilterPanelProps) {
  const {
    city,
    budgetMin,
    budgetMax,
    type,
    rooms,
    duration,
    aiMode,
    setCity,
    setBudget,
    setType,
    setRooms,
    setDuration,
    setAiMode,
    reset,
  } = useFilterStore()

  const content = (
    <div className={cn('space-y-5', className)}>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Город</label>
        <CitySelect value={city} onChange={setCity} />
      </div>
      <div>
        <span className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Бюджет</span>
        <BudgetRange min={budgetMin} max={budgetMax} onChange={setBudget} />
      </div>
      <FilterChips options={PROPERTY_TYPES} value={type} onChange={setType} label="Тип жилья" />
      <FilterChips options={DURATION_OPTIONS} value={duration} onChange={setDuration} label="Срок" />
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Комнаты</label>
        <FilterChips options={ROOMS_OPTIONS} value={rooms} onChange={setRooms} />
      </div>
      <AIModeSwitch aiMode={aiMode} onChange={setAiMode} />
      {showSearchButtons && (
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onSearch}
            className="w-full min-h-[48px] rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px]"
          >
            Найти
          </button>
          <button
            type="button"
            onClick={onSmartSearch}
            className="w-full min-h-[48px] rounded-[16px] border-2 border-[var(--accent)] text-[var(--accent)] font-semibold text-[14px] flex items-center justify-center gap-2"
          >
            Умный подбор ⚡
          </button>
        </div>
      )}
    </div>
  )

  if (embedded) return content

  return (
    <aside className={cn('rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 md:p-6')}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[18px] font-bold text-[var(--text-main)]">Фильтры</h2>
        <button
          type="button"
          onClick={reset}
          className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]"
        >
          Сбросить
        </button>
      </div>
      {content}
    </aside>
  )
}
