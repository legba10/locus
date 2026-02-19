'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { useFilterStore } from '@/core/filters'
import { CitySelect } from './CitySelect'
import { BudgetRange } from './BudgetRange'
import { FilterChips } from './FilterChips'
import { AIModeSwitch } from './AIModeSwitch'
import { PROPERTY_TYPES, DURATION_OPTIONS, ROOMS_OPTIONS } from '@/core/filters'
import { BottomSheet } from '@/components/ui/BottomSheet'

export interface FiltersModalProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  className?: string
}

export function FiltersModal({ open, onClose, onApply, className }: FiltersModalProps) {
  const { city, budgetMin, budgetMax, type, rooms, duration, aiMode, setCity, setBudget, setType, setRooms, setDuration, setAiMode, reset } = useFilterStore()
  const touchStartY = useRef(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleApply = () => {
    onApply()
    onClose()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY
    if (endY - touchStartY.current > 60) onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      maxHeight="78vh"
      animateClose
      className={cn('rounded-t-2xl border-0 max-w-none mx-0 bg-[var(--card)] border-t border-[var(--border)]', className)}
    >
      <div className="flex flex-col max-h-[78vh]" data-testid="filters-modal">
        <div
          className="shrink-0 pt-2 pb-1 flex justify-center touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-hidden
        >
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" aria-hidden />
        </div>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-[16px] font-bold text-[var(--text)]">Фильтры</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--sub)] hover:bg-[var(--border)]" aria-label="Закрыть">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 filter-panel-card__inner" data-testid="filters-modal-content">
          <div data-testid="filter-section-city">
            <label className="block text-[12px] font-medium text-[var(--sub)] mb-1.5">Город</label>
            <CitySelect value={city ?? ''} onChange={(v) => setCity(v || null)} placeholder="Выберите город" fullscreenOnMobile={false} />
          </div>
          <div data-testid="filter-section-budget">
            <span className="block text-[12px] font-medium text-[var(--sub)] mb-1.5">Бюджет</span>
            <BudgetRange min={budgetMin} max={budgetMax} onChange={setBudget} />
          </div>
          <FilterChips options={PROPERTY_TYPES} value={Array.isArray(type) ? (type[0] ?? '') : (type ?? '')} onChange={setType} label="Тип жилья" />
          <FilterChips options={DURATION_OPTIONS} value={duration} onChange={setDuration} label="Срок" />
          <div data-testid="filter-section-rooms">
            <label className="block text-[12px] font-medium text-[var(--sub)] mb-1.5">Комнаты</label>
            <FilterChips options={ROOMS_OPTIONS} value={Array.isArray(rooms) ? (rooms[0]?.toString() ?? '') : (rooms ?? '')} onChange={(v) => setRooms(v)} />
          </div>
          <AIModeSwitch aiMode={aiMode} onChange={setAiMode} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-t border-[var(--border)] shrink-0">
          <button type="button" onClick={() => { reset(); }} className="search-hero-ai-tz7-compact w-full sm:flex-1 min-h-[44px]">
            Сбросить
          </button>
          <button type="button" onClick={handleApply} className="search-hero-submit-tz7-compact w-full sm:flex-1 min-h-[44px]">
            Применить
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
