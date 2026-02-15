'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'
import { CitySelect } from './CitySelect'
import { BUDGET_PRESETS } from '@/core/filters'
import Link from 'next/link'

const STEPS = [
  { id: 1, title: 'Город' },
  { id: 2, title: 'Когда' },
  { id: 3, title: 'Бюджет' },
  { id: 4, title: 'С кем' },
  { id: 5, title: 'Цель' },
] as const

const WITH_WHOM = [
  { value: 'solo', label: 'Один' },
  { value: 'couple', label: 'Пара' },
  { value: 'family', label: 'Семья' },
  { value: 'friends', label: 'Друзья' },
]

const GOALS = [
  { value: 'work', label: 'Работа' },
  { value: 'relax', label: 'Отдых' },
  { value: 'travel', label: 'Путешествие' },
  { value: 'other', label: 'Другое' },
]

/** ТЗ-9: заглушки «почему подходит» для выдачи AI (без реального AI) */
const MOCK_REASONS = [
  'Подходит по бюджету и району',
  'Высокий рейтинг и отзывы',
  'Удобная транспортная доступность',
  'Соответствует вашим критериям',
  'Популярный вариант в выбранном районе',
]

export interface AIWizardModalProps {
  open: boolean
  onClose: () => void
  /** После завершения wizard — переход к результатам (например /listings?ai=true) */
  onComplete?: (params: { city: string; when: string; budgetMin: number; budgetMax: number; withWhom: string; goal: string }) => void
}

export function AIWizardModal({ open, onClose, onComplete }: AIWizardModalProps) {
  const [step, setStep] = useState(1)
  const [city, setCity] = useState('')
  const [when, setWhen] = useState('')
  const [budgetMin, setBudgetMin] = useState(0)
  const [budgetMax, setBudgetMax] = useState(50_000)
  const [withWhom, setWithWhom] = useState('')
  const [goal, setGoal] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setShowResults(false)
      setAnalyzing(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
    else {
      setAnalyzing(true)
      setTimeout(() => {
        setAnalyzing(false)
        setShowResults(true)
      }, 1500)
    }
  }

  const canNext = () => {
    if (step === 1) return city.trim().length > 0
    if (step === 2) return when.length > 0
    if (step === 3) return true
    if (step === 4) return withWhom.length > 0
    if (step === 5) return goal.length > 0
    return false
  }

  if (!open) return null

  const content = (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-4 z-[var(--z-overlay)]"
      aria-modal="true"
      role="dialog"
      aria-label="Подбор жилья с AI"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'relative w-full max-h-[90vh] overflow-y-auto rounded-t-[20px] md:rounded-[20px]',
          'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-main)]',
          'md:max-w-[480px] md:mx-auto shadow-xl'
        )}
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!showResults ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-[18px] font-bold">Подбор жилья с AI</h2>
              <button type="button" onClick={onClose} className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border)]" aria-label="Закрыть">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 pt-2 pb-4">
              <div className="flex gap-1 mb-6">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={cn('h-1 flex-1 rounded-full', step >= s.id ? 'bg-[var(--accent)]' : 'bg-[var(--border)]')}
                    aria-hidden
                  />
                ))}
              </div>
              {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-[14px] font-medium text-[var(--text-secondary)]">Город</label>
                  <CitySelect value={city} onChange={setCity} placeholder="Выберите город" />
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <label className="block text-[14px] font-medium text-[var(--text-secondary)]">Когда планируете заезд?</label>
                  <input
                    type="date"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className="w-full h-12 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 text-[var(--text-main)]"
                  />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <label className="block text-[14px] font-medium text-[var(--text-secondary)]">Бюджет (₽/мес)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] text-[var(--text-secondary)] mb-1">От</label>
                      <input
                        type="number"
                        value={budgetMin || ''}
                        onChange={(e) => setBudgetMin(Number(e.target.value) || 0)}
                        className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 text-[var(--text-main)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-[var(--text-secondary)] mb-1">До</label>
                      <input
                        type="number"
                        value={budgetMax || ''}
                        onChange={(e) => setBudgetMax(Number(e.target.value) || 0)}
                        className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-3 text-[var(--text-main)]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_PRESETS.slice(0, 4).map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => { setBudgetMin(p.min); setBudgetMax(p.max) }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-[13px] font-medium',
                          budgetMin === p.min ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-main)]'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-4">
                  <label className="block text-[14px] font-medium text-[var(--text-secondary)]">С кем едете?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WITH_WHOM.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setWithWhom(o.value)}
                        className={cn(
                          'h-12 rounded-xl border text-[14px] font-medium',
                          withWhom === o.value
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-main)]'
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-4">
                  <label className="block text-[14px] font-medium text-[var(--text-secondary)]">Цель поездки</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setGoal(o.value)}
                        className={cn(
                          'h-12 rounded-xl border text-[14px] font-medium',
                          goal === o.value
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-main)]'
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border)] flex gap-3">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-1 h-12 rounded-xl border border-[var(--border)] text-[var(--text-main)] font-medium text-[14px]">
                  Назад
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext()}
                className="flex-1 h-12 rounded-xl bg-[var(--accent)] text-white font-semibold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step < 5 ? 'Далее' : 'Подобрать'}
              </button>
            </div>
          </>
        ) : analyzing ? (
          <div className="p-8 flex flex-col items-center justify-center min-h-[280px]">
            <span className="inline-block w-10 h-10 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mb-4" aria-hidden />
            <p className="text-[16px] font-medium text-[var(--text-main)]">Анализируем варианты…</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-[18px] font-bold">Подбор по вашим критериям</h2>
              <button type="button" onClick={onClose} className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--border)]" aria-label="Закрыть">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              <p className="text-[14px] text-[var(--text-secondary)]">Показываем 5 лучших вариантов. Пока без реального AI — только структура.</p>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-[var(--text-main)]">Вариант {i}</p>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1">{MOCK_REASONS[i - 1]}</p>
                    </div>
                    <Link href="/listings" className="text-[14px] font-medium text-[var(--accent)] shrink-0">Смотреть →</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--border)]">
              <Link href="/listings?ai=true" className="block w-full h-12 rounded-xl bg-[var(--accent)] text-white font-semibold text-[14px] flex items-center justify-center">
                Перейти к результатам
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )

  const root = typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : document.body
  return createPortal(content, root)
}
