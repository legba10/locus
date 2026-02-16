'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'
import { CitySelect } from './CitySelect'

/** ТЗ-20: типы жилья — чипсы (необязательно) */
const PROPERTY_CHIPS = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'studio', label: 'Студия' },
  { value: 'house', label: 'Дом' },
] as const

export interface AIWizardModalProps {
  open: boolean
  onClose: () => void
  /** После завершения — переход на страницу поиска с фильтрами */
  onComplete?: (params: { city: string; budgetMin: number; budgetMax: number; when?: string; propertyType?: string }) => void
}

/** ТЗ-20: AI-подбор — модал на один экран: город, бюджет, даты, тип; loader 2–3 сек; переход на результаты */
export function AIWizardModal({ open, onClose, onComplete }: AIWizardModalProps) {
  const [city, setCity] = useState('')
  const [budgetMin, setBudgetMin] = useState(2000)
  const [budgetMax, setBudgetMax] = useState(10000)
  const [when, setWhen] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setValidationError('')
    } else {
      setAnalyzing(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleSubmit = () => {
    if (!city?.trim()) {
      setValidationError('Укажите хотя бы город')
      return
    }
    setValidationError('')
    setAnalyzing(true)
    const delay = 2500
    setTimeout(() => {
      setAnalyzing(false)
      onComplete?.({
        city: city.trim(),
        budgetMin,
        budgetMax,
        when: when || undefined,
        propertyType: propertyType || undefined,
      })
      onClose()
    }, delay)
  }

  if (!open) return null

  const content = (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-4 z-[var(--z-overlay)]"
      aria-modal="true"
      role="dialog"
      aria-label="Подбор жилья с AI"
    >
      {/* Overlay — click to close */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden
      />
      {/* ТЗ-20: desktop 520px, glass, radius 20px; mobile full screen slide up; open scale 0.96→1 160ms */}
      <div
        className={cn(
          'relative w-full max-h-[90vh] overflow-y-auto rounded-t-[20px] md:rounded-[20px]',
          'bg-[var(--card-bg)]/95 backdrop-blur-xl border border-[var(--border)] text-[var(--text-main)]',
          'md:max-w-[520px] md:mx-auto shadow-2xl',
          'transition-transform duration-[160ms] ease-out',
          mounted ? 'scale-100' : 'scale-[0.96]'
        )}
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!analyzing ? (
          <>
            <div className="flex items-center justify-between p-5 pb-2 border-b border-[var(--border)]">
              <div>
                <h2 className="text-[20px] font-bold text-[var(--text-main)]">
                  Подберём жильё за 10 секунд
                </h2>
                <p className="text-[14px] text-[var(--text-secondary)] mt-1">
                  AI найдёт лучшие варианты под ваш бюджет и даты
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
                aria-label="Закрыть"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* 1. Город */}
              <div>
                <label className="block text-[14px] font-medium text-[var(--text-secondary)] mb-2">Город</label>
                <CitySelect value={city} onChange={setCity} placeholder="Город" className="w-full" />
              </div>

              {/* 2. Бюджет за ночь */}
              <div>
                <label className="block text-[14px] font-medium text-[var(--text-secondary)] mb-2">Бюджет за ночь (₽)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] text-[var(--text-secondary)] mb-1">От</label>
                    <input
                      type="number"
                      min={0}
                      value={budgetMin || ''}
                      onChange={(e) => setBudgetMin(Number(e.target.value) || 0)}
                      className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 text-[var(--text-main)] text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[var(--text-secondary)] mb-1">До</label>
                    <input
                      type="number"
                      min={0}
                      value={budgetMax || ''}
                      onChange={(e) => setBudgetMax(Number(e.target.value) || 0)}
                      className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 text-[var(--text-main)] text-[14px]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Даты */}
              <div>
                <label className="block text-[14px] font-medium text-[var(--text-secondary)] mb-2">Когда планируете?</label>
                <input
                  type="date"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 text-[var(--text-main)] text-[14px]"
                />
              </div>

              {/* 4. Тип жилья (необязательно) */}
              <div>
                <label className="block text-[14px] font-medium text-[var(--text-secondary)] mb-2">Тип жилья (необязательно)</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_CHIPS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setPropertyType(propertyType === o.value ? '' : o.value)}
                      className={cn(
                        'px-4 py-2.5 rounded-xl text-[14px] font-medium border transition-colors',
                        propertyType === o.value
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-main)] hover:border-[var(--accent)]/50'
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {validationError && (
                <p className="text-[14px] text-red-500" role="alert">{validationError}</p>
              )}
            </div>

            {/* ТЗ-20: кнопки — Подобрать (primary), Закрыть (secondary); mobile fixed bottom */}
            <div className="sticky bottom-0 p-5 pt-4 border-t border-[var(--border)] bg-[var(--card-bg)] flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-xl border border-[var(--border)] text-[var(--text-main)] font-medium text-[14px] sm:flex-1"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="h-12 rounded-xl bg-[var(--accent)] text-white font-semibold text-[14px] sm:flex-1 hover:opacity-95 transition-opacity"
              >
                Подобрать
              </button>
            </div>
          </>
        ) : (
          /* ТЗ-20: loader 2–3 сек, текст "AI анализирует варианты…" */
          <div className="p-10 flex flex-col items-center justify-center min-h-[320px]">
            <span
              className="inline-block w-12 h-12 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mb-5"
              aria-hidden
            />
            <p className="text-[16px] font-medium text-[var(--text-main)]">AI анализирует варианты…</p>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">Подбираем лучшие по цене и локации</p>
          </div>
        )}
      </div>
    </div>
  )

  const root = typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : document.body
  return createPortal(content, root)
}
