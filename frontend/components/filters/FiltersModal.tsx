'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'
import { useFilterStore } from '@/core/filters'
import { CitySelect } from './CitySelect'
import { BudgetRange } from './BudgetRange'
import { FilterChips } from './FilterChips'
import { AIModeSwitch } from './AIModeSwitch'
import { PROPERTY_TYPES, DURATION_OPTIONS, ROOMS_OPTIONS } from '@/core/filters'
import { useModalLayer } from '@/shared/contexts/ModalContext'

const MODAL_ID = 'filters'

export interface FiltersModalProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  className?: string
}

export function FiltersModal({ open, onClose, onApply, className }: FiltersModalProps) {
  const { city, budgetMin, budgetMax, type, rooms, duration, aiMode, setCity, setBudget, setType, setRooms, setDuration, setAiMode, reset } = useFilterStore()
  const hasSlot = useModalLayer(MODAL_ID, open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !hasSlot) return null

  const handleApply = () => {
    onApply()
    onClose()
  }

  const content = (
    <div key="filters-modal-root" className={cn('filters-modal-tz7 fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-4', className)} style={{ zIndex: 'var(--z-overlay)' }} role="dialog" aria-modal="true" aria-label="Фильтры" data-testid="filters-modal">
      <div className="overlay" onClick={onClose} aria-hidden />
      <div
        key="filters-modal-panel"
        className={cn(
          'modal-panel modal-filters-tz7 relative flex flex-col w-full md:max-w-[540px] max-h-[90vh] rounded-t-[20px] md:rounded-[20px]'
        )}
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
        data-testid="filters-modal-panel"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-[18px] font-bold text-[var(--text-main)]">Фильтры</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass)]" aria-label="Закрыть">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5" data-testid="filters-modal-content">
          <div data-testid="filter-section-city">
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Город</label>
            <CitySelect value={city} onChange={setCity} placeholder="Выберите город" fullscreenOnMobile={false} />
          </div>
          <div data-testid="filter-section-budget">
            <span className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Бюджет</span>
            <BudgetRange min={budgetMin} max={budgetMax} onChange={setBudget} />
          </div>
          <FilterChips options={PROPERTY_TYPES} value={type} onChange={setType} label="Тип жилья" />
          <FilterChips options={DURATION_OPTIONS} value={duration} onChange={setDuration} label="Срок" />
          <div data-testid="filter-section-rooms">
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Комнаты</label>
            <FilterChips options={ROOMS_OPTIONS} value={rooms} onChange={setRooms} />
          </div>
          <AIModeSwitch aiMode={aiMode} onChange={setAiMode} />
        </div>
        <div className="sticky-footer-tz7 sticky bottom-0 flex gap-3 p-4 border-t border-[var(--border)] rounded-b-[20px] bg-inherit">
          <button type="button" onClick={() => { reset(); }} className="btn btn--secondary btn--md flex-1">
            Сбросить
          </button>
          <button type="button" onClick={handleApply} className="btn btn--primary btn--md flex-1">
            Применить
          </button>
        </div>
      </div>
    </div>
  )

  const root = typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : document.body
  return createPortal(content, root)
}
