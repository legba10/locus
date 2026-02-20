'use client'

/** TZ-29: Единый фильтр-модал. Bottom sheet 90%, порядок: город, бюджет, срок, тип, комнаты, радиус, доп. фильтры, режим AI, кнопки Сбросить/Применить. */

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/utils/cn'
import { useFilterStore } from '@/core/filters'
import { CitySelect } from './CitySelect'
import { BudgetRange } from './BudgetRange'
import { AIModeSwitch } from './AIModeSwitch'
import { PROPERTY_TYPES, DURATION_OPTIONS } from '@/core/filters'
import { BottomSheet } from '@/components/ui/BottomSheet'

const PROPERTY_TYPES_FILTER = PROPERTY_TYPES.filter((t) => t.value !== '')
const ROOMS_VALUES = [1, 2, 3, 4] as const
const RADIUS_KM_MIN = 1
const RADIUS_KM_MAX = 20

const AMENITY_OPTIONS = [
  { key: 'balcony', label: 'Балкон' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'parking', label: 'Парковка' },
  { key: 'pets', label: 'Можно с животными' },
  { key: 'ac', label: 'Кондиционер' },
] as const

export interface FiltersModalProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  className?: string
}

export function FiltersModal({ open, onClose, onApply, className }: FiltersModalProps) {
  const {
    city,
    budgetMin,
    budgetMax,
    type,
    rooms,
    duration,
    aiMode,
    radius,
    setCity,
    setBudget,
    setTypeList,
    setRooms,
    setDuration,
    setAiMode,
    setRadius,
    reset,
  } = useFilterStore()

  const touchStartY = useRef(0)
  const [citySelectOpen, setCitySelectOpen] = useState(false)
  const [extraOpen, setExtraOpen] = useState(false)
  const [amenities, setAmenities] = useState<Record<string, boolean>>({})

  const radiusKm = radius >= 1000 ? Math.round(radius / 1000) : radius
  const radiusDisplay = Math.min(RADIUS_KM_MAX, Math.max(RADIUS_KM_MIN, radiusKm))

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

  const handleReset = () => {
    reset()
    setAmenities({})
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY
    if (endY - touchStartY.current > 60) onClose()
  }

  const toggleAmenity = (key: string) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const roomsStr = Array.isArray(rooms) ? (rooms.length ? String(rooms[0]) : '') : (rooms != null && rooms !== '' ? String(rooms) : '')

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      maxHeight="90vh"
      animateClose
      className={cn('rounded-t-2xl border-0 max-w-none mx-0 bg-[var(--bg-main)] border-t border-[var(--border-main)]', className)}
    >
      <div className="flex flex-col max-h-[90vh]" data-testid="filters-modal">
        {/* Свайп-индикатор + заголовок + крестик */}
        <div
          className="shrink-0 pt-2 pb-1 flex justify-center touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-hidden
        >
          <div className="w-10 h-1 rounded-full bg-[var(--border-main)]" aria-hidden />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--border-main)] shrink-0">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)]">Фильтры</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-input)]" aria-label="Закрыть">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4" data-testid="filters-modal-content">
          {/* 1. Город — строка "Новосибирск   Изменить" */}
          <div data-testid="filter-section-city">
            <span className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Город</span>
            {citySelectOpen ? (
              <div className="space-y-2">
                <CitySelect value={city ?? ''} onChange={(v) => { setCity(v || null); setCitySelectOpen(false); }} placeholder="Выберите город" fullscreenOnMobile={false} />
                <button type="button" onClick={() => setCitySelectOpen(false)} className="text-[14px] font-medium text-[var(--accent)]">Готово</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCitySelectOpen(true)}
                className="w-full flex items-center justify-between min-h-[48px] px-4 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[15px]"
              >
                <span>{city || 'Выберите город'}</span>
                <span className="text-[var(--accent)] font-medium">Изменить</span>
              </button>
            )}
          </div>

          {/* 2. Бюджет — двойной слайдер + поля (От / До) */}
          <div data-testid="filter-section-budget">
            <span className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Бюджет, ₽/мес</span>
            <BudgetRange min={budgetMin} max={budgetMax} onChange={setBudget} showSlider={true} />
          </div>

          {/* 3. Срок аренды — Любой / Посуточно / Долгосрочно */}
          <div>
            <span className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Срок аренды</span>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value || '_any'}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={cn(
                    'min-h-[40px] px-4 rounded-[12px] text-[14px] font-medium transition-colors',
                    duration === opt.value
                      ? 'bg-[var(--accent)] text-[var(--button-primary-text)]'
                      : 'border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Тип жилья — чекбоксы (мультивыбор) */}
          <div>
            <span className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Тип жилья</span>
            <div className="space-y-2">
              {PROPERTY_TYPES_FILTER.map((t) => {
                const checked = type.includes(t.value)
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      const next = checked ? type.filter((x) => x !== t.value) : [...type, t.value]
                      setTypeList(next)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-[15px] transition-colors',
                      checked ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]' : 'border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                    )}
                  >
                    <span className={cn('inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2', checked ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-main)]')}>
                      {checked && <span className="text-white text-[12px]">✓</span>}
                    </span>
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5. Комнаты — кнопки 1, 2, 3, 4+ */}
          <div>
            <span className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Комнаты</span>
            <div className="flex flex-wrap gap-2">
              {ROOMS_VALUES.map((r) => {
                const val = r === 4 ? '4' : String(r)
                const active = roomsStr === val
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRooms(val)}
                    className={cn(
                      'min-h-[44px] min-w-[52px] rounded-[12px] px-4 text-[15px] font-medium transition-colors',
                      active ? 'bg-[var(--accent)] text-[var(--button-primary-text)]' : 'border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                    )}
                  >
                    {r === 4 ? '4+' : r}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 6. Радиус — слайдер 1–20 км */}
          <div>
            <span className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Радиус от центра</span>
            <input
              type="range"
              min={RADIUS_KM_MIN}
              max={RADIUS_KM_MAX}
              value={radiusDisplay}
              onChange={(e) => setRadius(Number(e.target.value) * 1000)}
              className="w-full h-2 rounded-full appearance-none bg-[var(--border-main)] accent-[var(--accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]"
              aria-label="Радиус в км"
            />
            <p className="mt-1 text-[14px] text-[var(--text-secondary)] tabular-nums">{radiusDisplay} км</p>
          </div>

          {/* 7. Доп. фильтры — свернутый блок */}
          <div>
            <button
              type="button"
              onClick={() => setExtraOpen((o) => !o)}
              className="w-full flex items-center justify-between min-h-[48px] px-4 rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[15px]"
            >
              <span>Доп. фильтры</span>
              <svg className={cn('w-5 h-5 transition-transform', extraOpen && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {extraOpen && (
              <div className="mt-2 space-y-2 pl-1">
                {AMENITY_OPTIONS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleAmenity(a.key)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[12px] px-4 py-2.5 text-left text-[14px] transition-colors',
                      amenities[a.key] ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                    )}
                  >
                    <span className={cn('inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border', amenities[a.key] ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-main)]')}>
                      {amenities[a.key] && <span className="text-white text-[10px]">✓</span>}
                    </span>
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 8. Режим поиска — AI / Ручной */}
          <div>
            <AIModeSwitch aiMode={aiMode} onChange={setAiMode} />
          </div>
        </div>

        {/* 9. Нижняя панель: Сбросить | Применить */}
        <div className="flex gap-3 p-4 border-t border-[var(--border-main)] shrink-0 bg-[var(--bg-main)] pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 min-h-[48px] rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold text-[14px] hover:bg-[var(--bg-input)] transition-colors"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-[2] min-h-[48px] rounded-[16px] bg-[var(--accent)] text-[var(--button-primary-text)] font-semibold text-[15px] hover:opacity-95 transition-opacity"
          >
            Применить
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
