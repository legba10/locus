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
        <FilterChips options={ROOMS_OPTIONS} value={rooms} onChange={setRooms} label="Комнаты" />
      </div>
      <AIModeSwitch aiMode={aiMode} onChange={setAiMode} />
      {showSearchButtons && (
        <div className="search-hero-actions-tz7 flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onSmartSearch}
            className="smart-cta-tz10 w-full"
            aria-label="Умный подбор AI"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <span>Умный подбор</span>
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="search-hero-submit-tz7 w-full"
          >
            Найти жильё
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
