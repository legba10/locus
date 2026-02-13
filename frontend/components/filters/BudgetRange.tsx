'use client'

import { useCallback, useMemo } from 'react'
import { cn } from '@/shared/utils/cn'
import { BUDGET_MIN, BUDGET_MAX, BUDGET_STEP } from '@/core/filters'

export interface BudgetRangeProps {
  min: number | ''
  max: number | ''
  onChange: (min: number | '', max: number | '') => void
  className?: string
}

function formatBudget(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

export function BudgetRange({ min, max, onChange, className }: BudgetRangeProps) {
  const minVal = min === '' ? BUDGET_MIN : Math.max(BUDGET_MIN, min)
  const maxVal = max === '' ? BUDGET_MAX : Math.min(BUDGET_MAX, Math.max(minVal, max))

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

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
