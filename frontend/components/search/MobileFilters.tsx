'use client'

/**
 * ТЗ-4.3: Мобильная панель фильтров — Bottom Sheet, свайп вниз, крестик, store.
 * Только mobile. Desktop не трогаем.
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { useFilterStore } from '@/core/filters'
import { BUDGET_MIN, BUDGET_MAX, BUDGET_STEP } from '@/core/filters'
import { PROPERTY_TYPES } from '@/core/filters'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { BudgetRange } from '@/components/filters/BudgetRange'
import { CITIES } from '@/shared/data/cities'
import { cn } from '@/shared/utils/cn'

const PROPERTY_TYPES_FILTER = PROPERTY_TYPES.filter((t) => t.value !== '')

function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

export interface MobileFiltersProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  /** Количество вариантов для кнопки «Показать N вариантов» */
  resultCount?: number
  className?: string
}

export function MobileFilters({
  open,
  onClose,
  onApply,
  resultCount,
  className,
}: MobileFiltersProps) {
  const {
    city,
    priceFrom,
    priceTo,
    budgetMin,
    budgetMax,
    rooms,
    type,
    radius,
    setCity,
    setBudget,
    setPrice,
    toggleRoom,
    setTypeList,
    setRadius,
    resetFilters,
  } = useFilterStore()

  const [cityOpen, setCityOpen] = useState(false)
  const [cityQuery, setCityQuery] = useState(city ?? '')
  const touchStartY = useRef(0)

  useEffect(() => {
    if (!open) return
    setCityQuery(city ?? '')
  }, [open, city])

  const cityFiltered = useMemo(() => {
    const q = cityQuery.trim().toLowerCase()
    if (!q) return CITIES.slice(0, 60)
    return CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 60)
  }, [cityQuery])

  const radiusKm = radius > 20 ? Math.round(radius / 1000) : radius
  const radiusDisplay = Math.min(20, Math.max(1, radiusKm))

  const handleClose = () => {
    onClose()
  }

  const handleApply = () => {
    onApply()
    onClose()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY
    if (endY - touchStartY.current > 80) handleClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      maxHeight="92vh"
      animateClose
      className={cn('mobile-filters-tz43-panel', className)}
    >
      <div
        className="mobile-filters-tz43-inner flex flex-col min-h-[70vh] max-h-[92vh]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header: Фильтры + ✕ */}
        <div className="mobile-filters-tz43-header flex items-center justify-between shrink-0 px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-[18px] font-bold text-[var(--text-main)]">Фильтры</h2>
          <button
            type="button"
            onClick={handleClose}
            className="mobile-filters-tz43-close w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--filter-bar-hover)] transition-colors"
            aria-label="Закрыть"
          >
            <span className="text-[24px] leading-none">×</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-5"
          onScroll={() => setCityOpen(false)}
        >
          {/* 1. Город */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Город</label>
            <div className="relative">
              <input
                type="text"
                value={cityOpen ? cityQuery : (city ?? '')}
                onChange={(e) => {
                  setCityQuery(e.target.value)
                  setCityOpen(true)
                }}
                onFocus={() => setCityOpen(true)}
                placeholder="Выберите город"
                className="mobile-filters-tz43-input w-full rounded-[12px] border border-[var(--border)] px-4 py-3 text-[15px] bg-[var(--bg-card)] text-[var(--text-main)] placeholder-[var(--text-secondary)]"
              />
              {cityOpen && (
                <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[220px] overflow-y-auto rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-lg">
                  {cityFiltered.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        className={cn(
                          'w-full px-4 py-3 text-left text-[15px] transition-colors',
                          c === city ? 'bg-[var(--accent-soft)] font-medium text-[var(--accent)]' : 'hover:bg-[var(--filter-bar-hover)]'
                        )}
                        onClick={() => {
                          setCity(c)
                          setCityOpen(false)
                        }}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 2. Цена: от/до + slider */}
          <div>
            <span className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Цена, ₽/мес</span>
            <BudgetRange min={budgetMin} max={budgetMax} onChange={setBudget} />
            <div className="mt-3">
              <input
                type="range"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={priceTo ?? BUDGET_MAX}
                onChange={(e) => setPrice(priceFrom, Number(e.target.value))}
                className="mobile-filters-tz43-slider w-full h-2 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]"
              />
            </div>
          </div>

          {/* 3. Комнаты: 1 2 3 4+ */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Комнаты</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={cn(
                    'min-h-[44px] min-w-[52px] rounded-[12px] px-4 text-[15px] font-medium transition-colors',
                    rooms.includes(r)
                      ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
                      : 'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--filter-bar-hover)]'
                  )}
                  onClick={() => toggleRoom(r)}
                >
                  {r === 4 ? '4+' : r}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Тип жилья: чекбоксы */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Тип жилья</label>
            <div className="space-y-2">
              {PROPERTY_TYPES_FILTER.map((t) => {
                const checked = type.includes(t.value)
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-[15px] transition-colors',
                      checked ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'hover:bg-[var(--filter-bar-hover)]'
                    )}
                    onClick={() => {
                      const next = checked ? type.filter((x) => x !== t.value) : [...type, t.value]
                      setTypeList(next)
                    }}
                  >
                    <span
                      className={cn(
                        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
                        checked ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]'
                      )}
                    >
                      {checked && <span className="text-white text-[12px]">✓</span>}
                    </span>
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5. Радиус */}
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Радиус: 1–20 км</label>
            <input
              type="range"
              min={1}
              max={20}
              value={radiusDisplay}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="mobile-filters-tz43-slider w-full h-2 rounded-full appearance-none bg-[var(--border)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]"
            />
            <p className="mt-1 text-[14px] text-[var(--text-secondary)]">{radiusDisplay} км</p>
          </div>
        </div>

        {/* Footer: Сбросить + Кнопка применить */}
        <div className="mobile-filters-tz43-footer shrink-0 flex flex-col gap-3 p-4 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetFilters}
              className="text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            >
              Сбросить
            </button>
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="mobile-filters-tz43-apply w-full min-h-[52px] rounded-[12px] bg-[var(--accent)] text-white font-semibold text-[16px] hover:opacity-95 transition-opacity"
          >
            {resultCount != null
              ? `Показать ${resultCount} ${resultCount === 1 ? 'вариант' : resultCount >= 2 && resultCount <= 4 ? 'варианта' : 'вариантов'}`
              : 'Применить'}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
