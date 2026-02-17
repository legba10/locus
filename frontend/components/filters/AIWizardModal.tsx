'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'
import { CitySelect } from './CitySelect'

/** ТЗ-5: типы жилья — Квартира, Студия, Дом, Комната */
const PROPERTY_OPTIONS = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'studio', label: 'Студия' },
  { value: 'house', label: 'Дом' },
  { value: 'room', label: 'Комната' },
] as const

/** ТЗ-5: пресеты бюджета (₽/мес) — до 30k, 30–50k, 50k+ */
const BUDGET_PRESETS = [
  { id: 'low', label: 'до 30 000', min: 0, max: 30000 },
  { id: 'mid', label: '30 000–50 000', min: 30000, max: 50000 },
  { id: 'high', label: '50 000+', min: 50000, max: 200000 },
] as const

export interface AIWizardModalProps {
  open: boolean
  onClose: () => void
  initialCity?: string
  onComplete?: (params: {
    city: string
    budgetMin: number
    budgetMax: number
    dateFrom?: string
    dateTo?: string
    propertyTypes?: string[]
  }) => void
}

/**
 * ТЗ-5: AI-подбор — overlay/modal, пошаговые шаги, body scroll lock, только скролл внутри модалки.
 * ТЗ-4: работает для всех (гость и авторизованный). Submit → onComplete(params) → родитель делает router.push(/listings?…). Никакого перехода в объявление, без loading state чтобы не зависать.
 * Закрытие: крестик, Esc, клик по overlay.
 */
export function AIWizardModal({ open, onClose, initialCity = '', onComplete }: AIWizardModalProps) {
  const [city, setCity] = useState('')
  const [budgetPresetId, setBudgetPresetId] = useState<string>('mid')
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [validationError, setValidationError] = useState('')

  const budgetMin = BUDGET_PRESETS.find((p) => p.id === budgetPresetId)?.min ?? 30000
  const budgetMax = BUDGET_PRESETS.find((p) => p.id === budgetPresetId)?.max ?? 50000

  /** ТЗ-5: body overflow hidden только пока модалка открыта; после закрытия — overflow auto */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev || ''
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setCity(initialCity?.trim() ?? '')
      setValidationError('')
    }
  }, [open, initialCity])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const toggleProperty = (value: string) => {
    setPropertyTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleSubmit = () => {
    if (!city?.trim()) {
      setValidationError('Укажите город')
      return
    }
    setValidationError('')
    onComplete?.({
      city: city.trim(),
      budgetMin,
      budgetMax,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      propertyTypes: propertyTypes.length > 0 ? propertyTypes : undefined,
    })
    onClose()
  }

  if (!open) return null

  const content = (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center z-[var(--z-overlay)] pointer-events-auto"
      aria-modal="true"
      role="dialog"
      aria-label="Подбор жилья с AI"
    >
      <div
        className="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* ТЗ-5: bottom sheet на mobile, modal на desktop; скролл только внутри панели */}
      <div
        className={cn(
          'relative w-full max-h-[90vh] flex flex-col',
          'rounded-t-[24px]',
          'bg-[var(--bg-card)] border border-b-0 border-[var(--border-main)]',
          'text-[var(--text-primary)] shadow-2xl',
          'md:max-w-[520px] md:rounded-[24px] md:border-b md:mx-auto md:max-h-[85vh]'
        )}
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок + крестик — не скроллится */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 p-5 pb-0">
          <div className="min-w-0">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)] leading-tight">
              Подберём жильё за 10 секунд
            </h2>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">
              AI найдёт лучшие варианты под вас
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] shrink-0"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Контент — скролл только здесь */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-6 pb-2">
            {/* Шаг 1: Город */}
            <div>
              <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Шаг 1</p>
              <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Где ищете?</label>
              <div className="rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)] overflow-hidden">
                <CitySelect value={city} onChange={setCity} placeholder="Город" className="w-full" />
              </div>
            </div>

            {/* Шаг 2: Бюджет — пресеты */}
            <div>
              <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Шаг 2</p>
              <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Бюджет (₽/мес)</label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBudgetPresetId(p.id)}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-[14px] font-medium border transition-colors',
                      budgetPresetId === p.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                        : 'border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)]/50'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Шаг 3: Тип жилья */}
            <div>
              <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Шаг 3</p>
              <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Тип жилья</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleProperty(o.value)}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-[14px] font-medium border transition-colors',
                      propertyTypes.includes(o.value)
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                        : 'border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)]/50'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Шаг 4: Даты */}
            <div>
              <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Шаг 4</p>
              <label className="block text-[14px] font-medium text-[var(--text-primary)] mb-2">Даты</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-[var(--text-secondary)] mb-1">Заезд</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full h-12 rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)] px-3 text-[var(--text-primary)] text-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--text-secondary)] mb-1">Выезд</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full h-12 rounded-xl border border-[var(--border-main)] bg-[var(--bg-input)] px-3 text-[var(--text-primary)] text-[14px]"
                  />
                </div>
              </div>
            </div>

            {validationError && (
              <p className="text-[14px] text-[#ff6b6b]" role="alert">{validationError}</p>
            )}
          </div>
        </div>

        {/* Футер — не скроллится */}
        <div className="flex-shrink-0 p-5 pt-4 border-t border-[var(--border-main)] bg-[var(--bg-card)] space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold text-[14px] hover:opacity-95 transition-opacity"
          >
            Подобрать
          </button>
          <p className="text-[12px] text-[var(--text-secondary)] text-center">
            Обычный поиск — вы настраиваете всё сами. AI-подбор — система сама находит лучшие варианты.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl border border-[var(--border-main)] bg-transparent text-[var(--text-primary)] font-medium text-[14px] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )

  const root = typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : document.body
  return createPortal(content, root)
}
