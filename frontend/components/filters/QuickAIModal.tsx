'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CitySelect } from './CitySelect'
import { BudgetRange } from './BudgetRange'
import { FilterChips } from './FilterChips'
import { PROPERTY_TYPES } from '@/core/filters'
import { useModalLayer } from '@/shared/contexts/ModalContext'

const MODAL_ID = 'quick-ai'

export interface QuickAIModalProps {
  open: boolean
  onClose: () => void
  city: string
  budgetMin: number | ''
  budgetMax: number | ''
  type?: string
  onCityChange: (city: string) => void
  onBudgetChange: (min: number | '', max: number | '') => void
  onTypeChange?: (value: string) => void
  onLaunch: () => void
}

export function QuickAIModal(props: QuickAIModalProps) {
  const {
    open,
    onClose,
    city,
    budgetMin,
    budgetMax,
    type = '',
    onCityChange,
    onBudgetChange,
    onTypeChange,
    onLaunch,
  } = props

  const hasSlot = useModalLayer(MODAL_ID, open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !hasSlot) return null

  const handleLaunch = () => {
    onLaunch()
    onClose()
  }

  const content = (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ zIndex: 'var(--z-overlay)' }}
      aria-modal="true"
      role="dialog"
      aria-label="Умный подбор AI"
    >
      <div className="overlay" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'quick-ai-modal-tz7 modal-panel relative w-full max-h-[90vh] overflow-y-auto',
          'rounded-t-[20px] md:rounded-[20px]',
          'md:max-w-[420px] md:mx-auto',
          'p-6'
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
            <CitySelect value={city} onChange={onCityChange} placeholder="Выберите город" />
          </div>
          <div>
            <span className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Бюджет</span>
            <BudgetRange min={budgetMin} max={budgetMax} onChange={onBudgetChange} />
          </div>
          {onTypeChange && (
            <FilterChips options={PROPERTY_TYPES} value={type} onChange={onTypeChange} label="Тип жилья" />
          )}
        </div>
        <button type="button" onClick={handleLaunch} className="mt-6 w-full min-h-[52px] rounded-[16px] btn btn--primary btn--md">
          Найти варианты
        </button>
      </div>
    </div>
  )

  const root = typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : document.body
  return createPortal(content, root)
}
