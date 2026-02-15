'use client'

import { useCallback, useMemo } from 'react'
import { cn } from '@/shared/utils/cn'
import { BUDGET_MIN, BUDGET_MAX, BUDGET_STEP } from '@/core/filters'

const SLIDER_MAX = 50_000

export interface BudgetRangeProps {
  min: number | ''
  max: number | ''
  onChange: (min: number | '', max: number | '') => void
  className?: string
  /** ТЗ-9: плавный слайдер 0–50k вместо только полей */
  showSlider?: boolean
}

function formatBudget(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

export function BudgetRange({ min, max, onChange, className, showSlider = true }: BudgetRangeProps) {
  const minVal = min === '' ? BUDGET_MIN : Math.max(BUDGET_MIN, min)
  const maxVal = max === '' ? BUDGET_MAX : Math.min(BUDGET_MAX, Math.max(minVal, max))
  const sliderMin = useMemo(() => Math.min(minVal, SLIDER_MAX), [minVal])
  const sliderMaxVal = useMemo(() => Math.min(maxVal, SLIDER_MAX), [maxVal])

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value ? Number(e.target.value) : ''
      onChange(v, max)
    },
    [max, onChange]
  )
  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value ? Number(e.target.value) : ''
      onChange(min, v)
    },
    [min, onChange]
  )

  const handleSliderMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      const newMax = max === '' || max > v ? max : v
      onChange(v, newMax === '' ? '' : newMax)
    },
    [max, onChange]
  )
  const handleSliderMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      const newMin = min === '' || min < v ? min : v
      onChange(newMin === '' ? '' : newMin, v)
    },
    [min, onChange]
  )

  const displayLine = useMemo(() => {
    if (min === '' && max === '') return 'Любой бюджет'
    if (min !== '' && max === '') return `${formatBudget(minVal)} — без верхней границы`
    if (min === '' && max !== '') return `до ${formatBudget(maxVal)} ₽`
    return `${formatBudget(minVal)} — ${formatBudget(maxVal)} ₽`
  }, [min, max, minVal, maxVal])

  const inputClasses = cn(
    'w-full rounded-[14px] px-4 py-3 text-[14px] tabular-nums',
    'bg-[var(--bg-card)] border border-[var(--border)]',
    'text-[var(--text-main)] placeholder-[var(--text-secondary)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]'
  )

  const rangeClass = cn(
    'w-full h-2 rounded-full appearance-none cursor-pointer transition-opacity',
    'bg-[var(--border)] accent-[var(--accent)]',
    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-md',
    '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border-0'
  )

  return (
    <div className={cn('space-y-3', className)}>
      {showSlider && (
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-[var(--text-secondary)]">Бюджет, ₽ (0 — 50 000)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="range"
              min={BUDGET_MIN}
              max={SLIDER_MAX}
              step={1000}
              value={sliderMin}
              onChange={handleSliderMin}
              className={rangeClass}
              aria-label="Минимальный бюджет"
            />
            <input
              type="range"
              min={BUDGET_MIN}
              max={SLIDER_MAX}
              step={1000}
              value={sliderMaxVal}
              onChange={handleSliderMax}
              className={rangeClass}
              aria-label="Максимальный бюджет"
            />
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] tabular-nums">
            {formatBudget(sliderMin)} — {formatBudget(sliderMaxVal)} ₽
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">От, ₽</label>
          <input
            type="number"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={min === '' ? '' : min}
            onChange={handleMinChange}
            placeholder="0"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">До, ₽</label>
          <input
            type="number"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={max === '' ? '' : max}
            onChange={handleMaxChange}
            placeholder={formatBudget(BUDGET_MAX)}
            className={inputClasses}
          />
        </div>
      </div>
      <p className="text-[13px] text-[var(--text-secondary)] tabular-nums whitespace-nowrap overflow-hidden text-ellipsis" title={displayLine}>
        {displayLine}
      </p>
    </div>
  )
}
