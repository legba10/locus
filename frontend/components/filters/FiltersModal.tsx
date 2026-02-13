'use client'

import { cn } from '@/shared/utils/cn'
import { useFilterStore } from '@/core/filters'
import { CitySelect } from './CitySelect'
import { BudgetRange } from './BudgetRange'
import { FilterChips } from './FilterChips'
import { AIModeSwitch } from './AIModeSwitch'
import { PROPERTY_TYPES, DURATION_OPTIONS, ROOMS_OPTIONS } from '@/core/filters'

export interface FiltersModalProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  className?: string
}

export function FiltersModal({ open, onClose, onApply, className }: FiltersModalProps) {
  const { city, budgetMin, budgetMax, type, rooms, duration, aiMode, setCity, setBudget, setType, setRooms, setDuration, setAiMode, reset } = useFilterStore()

  if (!open) return null

  const handleApply = () => {
    onApply()
    onClose()
  }

  return (
    <div className={cn('fixed inset-0 z-[var(--z-overlay)] flex items-end md:items-center justify-center', className)} role="dialog" aria-modal="true" aria-label="Фильтры">
      <div className="absolute inset-0 bg-[var(--overlay-bg)]" onClick={onClose} aria-hidden />
      <div
        className="relative flex flex-col w-full md:max-w-md max-h-[90vh] rounded-t-[24px] md:rounded-[24px] bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--shadow-modal)]"
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-[18px] font-bold text-[var(--text-main)]">Фильтры</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass)]" aria-label="Закрыть">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Город</label>
            <CitySelect value={city} onChange={setCity} placeholder="Выберите город" fullscreenOnMobile={false} />
          </div>
          <div>
            <span className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Бюджет</span>
            <BudgetRange min={budgetMin} max={budgetMax} onChange={setBudget} />
          </div>
          <FilterChips options={PROPERTY_TYPES} value={type} onChange={setType} label="Тип жилья" />
          <FilterChips options={DURATION_OPTIONS} value={duration} onChange={setDuration} label="Срок" />
          <div>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">Комнаты</label>
            <FilterChips options={ROOMS_OPTIONS} value={rooms} onChange={setRooms} />
          </div>
          <AIModeSwitch aiMode={aiMode} onChange={setAiMode} />
        </div>
        <div className="sticky bottom-0 flex gap-3 p-4 border-t border-[var(--border)] bg-[var(--bg-card)] rounded-b-[24px]">
          <button type="button" onClick={() => { reset(); }} className="flex-1 min-h-[48px] rounded-[16px] border-2 border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] font-semibold text-[14px]">
            Сбросить
          </button>
          <button type="button" onClick={handleApply} className="flex-1 min-h-[48px] rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[14px]">
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}
