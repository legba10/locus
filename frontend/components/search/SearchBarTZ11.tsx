'use client'

import { cn } from '@/shared/utils/cn'

export interface SearchBarTZ11Props {
  /** Текст в поле поиска (район или метро) */
  query: string
  onQueryChange: (value: string) => void
  /** Открыть панель фильтров (mobile: кнопка "Фильтры") */
  onOpenFilters: () => void
  /** Количество активных фильтров для бейджа */
  activeFiltersCount?: number
  className?: string
}

/**
 * ТЗ №11: верхний блок поиска.
 * Одна строка: поле "Район или метро" + на mobile кнопка "Фильтры".
 */
export function SearchBarTZ11({
  query,
  onQueryChange,
  onOpenFilters,
  activeFiltersCount = 0,
  className,
}: SearchBarTZ11Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center',
        'rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-3 sm:p-4',
        className
      )}
    >
      <div className="relative flex-1">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Район или метро"
          className={cn(
            'w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)]',
            'py-3 pl-10 pr-3 text-[15px] text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]'
          )}
          aria-label="Поиск по району или метро"
        />
      </div>

      {/* Кнопка «Фильтры» — на mobile всегда видна, на desktop тоже можно оставить */}
      <button
        type="button"
        onClick={onOpenFilters}
        className={cn(
          'flex items-center justify-center gap-2 shrink-0',
          'h-12 px-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)]',
          'text-[15px] font-medium text-[var(--text-primary)]',
          'hover:bg-[var(--bg-input)] transition-colors',
          'sm:min-w-[120px]'
        )}
        aria-expanded={false}
        aria-haspopup="dialog"
      >
        <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Фильтры
        {activeFiltersCount > 0 && (
          <span
            className="min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] text-[12px] font-semibold flex items-center justify-center"
            aria-hidden
          >
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  )
}
