'use client'

import { useRef } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { cn } from '@/shared/utils/cn'

export interface FiltersTZ11 {
  priceFrom: string
  priceTo: string
  rooms: number | null
  district: string
  /** Тип жилья: apartment | room | studio | house | '' */
  propertyType?: string
}

export interface FiltersSheetTZ11Props {
  open: boolean
  onClose: () => void
  filters: FiltersTZ11
  onFiltersChange: (f: FiltersTZ11) => void
  onApply: () => void
}

const ROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
]

const PROPERTY_TYPES = [
  { value: '', label: 'Любой' },
  { value: 'apartment', label: 'Квартира' },
  { value: 'room', label: 'Комната' },
  { value: 'studio', label: 'Студия' },
  { value: 'house', label: 'Дом' },
]

/**
 * ТЗ №11: Bottom Sheet с фильтрами — цена от/до, комнаты (chips), тип жилья, район.
 * height 90%, кнопка «Применить» sticky внизу.
 */
export function FiltersSheetTZ11({
  open,
  onClose,
  filters,
  onFiltersChange,
  onApply,
}: FiltersSheetTZ11Props) {
  const touchStartY = useRef(0)

  const handleApply = () => {
    onApply()
    onClose()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY
    if (endY - touchStartY.current > 80) onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      maxHeight="90vh"
      animateClose
      className="bg-[var(--bg-card)] border-t border-[var(--border-main)]"
    >
      <div
        className="flex flex-col h-full min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--border-main)]">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)]">Фильтры</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Цена от / до */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Цена, ₽ / мес</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                placeholder="от"
                value={filters.priceFrom}
                onChange={(e) => onFiltersChange({ ...filters, priceFrom: e.target.value })}
                className={cn(
                  'w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)]',
                  'px-3 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30'
                )}
              />
              <input
                type="number"
                min={0}
                placeholder="до"
                value={filters.priceTo}
                onChange={(e) => onFiltersChange({ ...filters, priceTo: e.target.value })}
                className={cn(
                  'w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)]',
                  'px-3 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30'
                )}
              />
            </div>
          </div>

          {/* Комнаты — chips */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Комнаты</label>
            <div className="flex flex-wrap gap-2">
              {ROOM_OPTIONS.map((opt) => {
                const isActive = filters.rooms === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        rooms: isActive ? null : opt.value,
                      })
                    }
                    className={cn(
                      'min-w-[48px] px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors',
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-main)] hover:border-[var(--accent)]/50'
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Тип жилья */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Тип жилья</label>
            <select
              value={filters.propertyType ?? ''}
              onChange={(e) => onFiltersChange({ ...filters, propertyType: e.target.value })}
              className={cn(
                'w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)]',
                'px-3 py-3 text-[15px] text-[var(--text-primary)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30'
              )}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Район */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Район</label>
            <input
              type="text"
              placeholder="Например: Таганская"
              value={filters.district}
              onChange={(e) => onFiltersChange({ ...filters, district: e.target.value })}
              className={cn(
                'w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)]',
                'px-3 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30'
              )}
            />
          </div>
        </div>

        {/* Sticky кнопка Применить */}
        <div className="flex-shrink-0 flex gap-3 p-4 border-t border-[var(--border-main)] bg-[var(--bg-card)]">
          <button
            type="button"
            onClick={() =>
              onFiltersChange({
                priceFrom: '',
                priceTo: '',
                rooms: null,
                district: '',
                propertyType: '',
              })
            }
            className={cn(
              'flex-1 h-12 rounded-xl border border-[var(--border-main)]',
              'text-[15px] font-medium text-[var(--text-primary)]',
              'hover:bg-[var(--bg-input)] transition-colors'
            )}
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={handleApply}
            className={cn(
              'flex-1 h-12 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[15px]',
              'hover:opacity-95 transition-opacity'
            )}
          >
            Применить
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
