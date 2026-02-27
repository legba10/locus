'use client'

/**
 * ТЗ-4.2: Панель фильтров (desktop) — одна строка, стиль Airbnb в стиле LOCUS.
 * Подключена к useFilterStore. Только desktop; mobile — ТЗ-4.3.
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { useFilterStore } from '@/core/filters'
import { BUDGET_MIN, BUDGET_MAX, BUDGET_STEP } from '@/core/filters'
import { PROPERTY_TYPES } from '@/core/filters'
import type { SortOption } from '@/core/filters'
import { CITIES } from '@/shared/data/cities'
import { cn } from '@/shared/utils/cn'

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Популярные',
  price_asc: 'Дешевле',
  price_desc: 'Дороже',
}

const PROPERTY_TYPES_FILTER = PROPERTY_TYPES.filter((t) => t.value !== '')

function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

export interface FilterBarProps {
  /** Открыть расширенные фильтры (ТЗ-4.3) */
  onOpenFilters?: () => void
  className?: string
}

export function FilterBar({ onOpenFilters, className }: FilterBarProps) {
  const store = useFilterStore()
  const {
    city,
    priceFrom,
    priceTo,
    rooms,
    type,
    radius,
    sort,
    setCity,
    setPrice,
    toggleRoom,
    setTypeList,
    setRadius,
    setSort,
  } = store

  const [cityOpen, setCityOpen] = useState(false)
  const [cityQuery, setCityQuery] = useState(city ?? '')
  const [priceOpen, setPriceOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [radiusOpen, setRadiusOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const cityRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)
  const radiusRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cityOpen) setCityQuery(city ?? '')
  }, [city, cityOpen])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        cityRef.current?.contains(e.target as Node) ||
        priceRef.current?.contains(e.target as Node) ||
        typeRef.current?.contains(e.target as Node) ||
        radiusRef.current?.contains(e.target as Node) ||
        sortRef.current?.contains(e.target as Node)
      ) return
      setCityOpen(false)
      setPriceOpen(false)
      setTypeOpen(false)
      setRadiusOpen(false)
      setSortOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const cityFiltered = useMemo(() => {
    const q = cityQuery.trim().toLowerCase()
    if (!q) return CITIES.slice(0, 60)
    return CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 60)
  }, [cityQuery])

  const priceLabel = useMemo(() => {
    if (priceFrom == null && priceTo == null) return 'Цена'
    if (priceFrom != null && priceTo != null) return `${formatPrice(priceFrom)} — ${formatPrice(priceTo)} ₽`
    if (priceFrom != null) return `от ${formatPrice(priceFrom)} ₽`
    if (priceTo != null) return `до ${formatPrice(priceTo)} ₽`
    return 'Цена'
  }, [priceFrom, priceTo])

  const radiusKm = radius > 20 ? Math.round(radius / 1000) : radius
  const radiusDisplay = Math.min(20, Math.max(1, radiusKm))
  const typeLabel = type.length === 0 ? 'Тип жилья' : type.map((v) => PROPERTY_TYPES.find((t) => t.value === v)?.label ?? v).join(', ')

  const barButtonClass = cn(
    'filter-bar-tz42-btn h-10 rounded-[10px] px-3 text-[14px] font-medium transition-colors',
    'bg-transparent border border-[var(--filter-bar-border)] text-[var(--filter-bar-text)]',
    'hover:bg-[var(--filter-bar-hover)]'
  )

  return (
    <div className={cn('filter-bar-tz42', className)}>
      <div className="filter-bar-tz42-inner">
        {/* Город — 220px */}
        <div className="relative w-[220px] shrink-0" ref={cityRef}>
          <input
            type="text"
            value={cityOpen ? cityQuery : (city ?? '')}
            onChange={(e) => {
              setCityQuery(e.target.value)
              setCityOpen(true)
            }}
            onFocus={() => setCityOpen(true)}
            placeholder="Город"
            className={cn(barButtonClass, 'w-full text-left')}
          />
          {cityOpen && (
            <div className="filter-bar-tz42-dropdown absolute left-0 top-full z-20 mt-1 max-h-[280px] w-full overflow-y-auto rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-lg">
              {cityFiltered.length === 0 ? (
                <div className="px-3 py-4 text-[14px] text-[var(--text-secondary)]">Город не найден</div>
              ) : (
                <ul className="py-1">
                  {cityFiltered.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        className={cn(
                          'w-full px-3 py-2.5 text-left text-[14px] transition-colors',
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
          )}
        </div>

        {/* Цена — popover */}
        <div className="relative shrink-0" ref={priceRef}>
          <button type="button" className={cn(barButtonClass, 'min-w-[100px]')} onClick={() => setPriceOpen((v) => !v)}>
            {priceLabel}
          </button>
          {priceOpen && (
            <div className="filter-bar-tz42-popover filter-bar-tz42-popover--price absolute left-0 top-full z-20 mt-1 w-[280px] rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-[var(--text-secondary)]">От, ₽</label>
                  <input
                    type="number"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={priceFrom ?? ''}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : null, priceTo)}
                    className="filter-bar-tz42-input w-full rounded-[10px] border border-[var(--border)] px-3 py-2 text-[14px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-[var(--text-secondary)]">До, ₽</label>
                  <input
                    type="number"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={BUDGET_STEP}
                    value={priceTo ?? ''}
                    onChange={(e) => setPrice(priceFrom, e.target.value ? Number(e.target.value) : null)}
                    className="filter-bar-tz42-input w-full rounded-[10px] border border-[var(--border)] px-3 py-2 text-[14px]"
                  />
                </div>
              </div>
              <div className="h-6">
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={priceTo ?? BUDGET_MAX}
                  onChange={(e) => setPrice(priceFrom, Number(e.target.value))}
                  className="h-2 w-full appearance-none rounded-full bg-[var(--border)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3b82f6]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Комнаты — 1 2 3 4+ */}
        <div className="flex shrink-0 items-center gap-1">
          {[1, 2, 3, 4].map((r) => (
            <button
              key={r}
              type="button"
              className={cn(
                'filter-bar-tz42-btn h-10 min-w-[40px] rounded-[10px] px-3 text-[14px] font-medium transition-colors',
                rooms.includes(r)
                  ? 'bg-[var(--accent)] text-[var(--text-on-accent)] border-[var(--accent)]'
                  : 'border border-[var(--filter-bar-border)] text-[var(--filter-bar-text)] hover:bg-[var(--filter-bar-hover)]'
              )}
              onClick={() => toggleRoom(r)}
            >
              {r === 4 ? '4+' : r}
            </button>
          ))}
        </div>

        {/* Тип жилья — multiselect dropdown */}
        <div className="relative shrink-0" ref={typeRef}>
          <button type="button" className={cn(barButtonClass, 'min-w-[120px]')} onClick={() => setTypeOpen((v) => !v)}>
            {typeLabel}
          </button>
          {typeOpen && (
            <div className="filter-bar-tz42-dropdown absolute left-0 top-full z-20 mt-1 w-[180px] rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-lg">
              {PROPERTY_TYPES_FILTER.map((t) => {
                const checked = type.includes(t.value)
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2.5 text-left text-[14px] transition-colors',
                      checked ? 'bg-[var(--accent-soft)] font-medium text-[var(--accent)]' : 'hover:bg-[var(--filter-bar-hover)]'
                    )}
                    onClick={() => {
                      const next = checked ? type.filter((x) => x !== t.value) : [...type, t.value]
                      setTypeList(next)
                    }}
                  >
                    <span className={cn('inline-block h-4 w-4 rounded border', checked ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]')} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Радиус — 1–20 км */}
        <div className="relative shrink-0" ref={radiusRef}>
          <button type="button" className={cn(barButtonClass, 'min-w-[80px]')} onClick={() => setRadiusOpen((v) => !v)}>
            {radiusDisplay} км
          </button>
          {radiusOpen && (
            <div className="filter-bar-tz42-popover absolute left-0 top-full z-20 mt-1 w-[200px] rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg">
              <label className="mb-2 block text-[12px] font-medium text-[var(--text-secondary)]">Радиус: 1–20 км</label>
              <input
                type="range"
                min={1}
                max={20}
                value={radiusDisplay}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="h-2 w-full appearance-none rounded-full bg-[var(--border)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3b82f6]"
              />
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{radiusDisplay} км</p>
            </div>
          )}
        </div>

        {/* Кнопка Фильтры */}
        <button
          type="button"
          className={cn(barButtonClass, 'shrink-0')}
          onClick={onOpenFilters}
          aria-label="Расширенные фильтры"
        >
          <span className="text-[18px]">⚙</span>
        </button>

        {/* Сортировка */}
        <div className="relative ml-auto shrink-0" ref={sortRef}>
          <button type="button" className={cn(barButtonClass, 'min-w-[120px]')} onClick={() => setSortOpen((v) => !v)}>
            {SORT_LABELS[sort]}
          </button>
          {sortOpen && (
            <div className="filter-bar-tz42-dropdown absolute right-0 top-full z-20 mt-1 w-[160px] rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-lg">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-[14px] transition-colors',
                    s === sort ? 'bg-[var(--accent-soft)] font-medium text-[var(--accent)]' : 'hover:bg-[var(--filter-bar-hover)]'
                  )}
                  onClick={() => {
                    setSort(s)
                    setSortOpen(false)
                  }}
                >
                  {SORT_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
