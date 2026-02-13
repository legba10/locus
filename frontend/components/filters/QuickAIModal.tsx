'use client'

import { CitySelect } from './CitySelect'
import { BudgetRange } from './BudgetRange'
import { cn } from '@/shared/utils/cn'

export interface QuickAIModalProps {
  open: boolean
  onClose: () => void
  city: string
  budgetMin: number | ''
  budgetMax: number | ''
  onCityChange: (city: string) => void
  onBudgetChange: (min: number | '', max: number | '') => void
  onLaunch: () => void
}

export function QuickAIModal(props: QuickAIModalProps) {
  const {
    open,
    onClose,
    city,
    budgetMin,
    budgetMax,
    onCityChange,
    onBudgetChange,
    onLaunch,
  } = props

  if (!open) return null

  const handleLaunch = () => {
    onLaunch()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end md:items-center justify-center" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-[var(--overlay-bg)]" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'relative w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto',
          'rounded-t-[24px] md:rounded-[24px]',
          'bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--shadow-modal)]',
          'p-5 md:p-6'
        )}
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-bold text-[var(--text-main)]">Умный подбор AI</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass)]" aria-label="Закрыть">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Город</label>
            <CitySelect value={city} onChange={onCityChange} placeholder="Например, Москва" />
          </div>
          <div>
            <span className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Бюджет</span>
            <BudgetRange min={budgetMin} max={budgetMax} onChange={onBudgetChange} />
          </div>
        </div>
        <button type="button" onClick={handleLaunch} className="mt-6 w-full min-h-[48px] rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px]">
          Запустить AI подбор
        </button>
      </div>
    </div>
  )
}
