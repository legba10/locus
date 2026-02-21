'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalLayer } from '@/shared/contexts/ModalContext'
import { aiSearch, type AiSearchFilters, type AiSearchInput, type AiListingCandidate } from '@/lib/ai/searchEngine'
import { useAiSearchStore } from '@/core/aiSearch/aiSearchStore'

const MODAL_ID = 'ai-search-modal'

const QUICK_CHIPS = ['сегодня', 'центр', 'рядом метро', 'тихо', 'можно с питомцем']

interface AiSearchModalApplyPayload {
  parsed: AiSearchFilters
  items: Array<AiListingCandidate & { aiMatchScore: number }>
}

interface AiSearchModalProps {
  open: boolean
  onClose: () => void
  listings: AiListingCandidate[]
  defaults?: Partial<AiSearchFilters>
  onApply: (payload: AiSearchModalApplyPayload) => void
}

export function AiSearchModal({ open, onClose, listings, defaults, onApply }: AiSearchModalProps) {
  const hasSlot = useModalLayer(MODAL_ID, open)
  const session = useAiSearchStore()
  const [mode, setMode] = useState<'quick' | 'step'>('quick')
  const [query, setQuery] = useState(session.query || '')
  const [city, setCity] = useState(session.city || defaults?.city || '')
  const [dateFrom, setDateFrom] = useState(session.dateFrom || defaults?.dateFrom || '')
  const [budgetMax, setBudgetMax] = useState<number | ''>(session.budgetMax ?? defaults?.budgetMax ?? '')
  const [guests, setGuests] = useState<number>(session.guests || defaults?.guests || 2)
  const [rooms, setRooms] = useState<number | ''>(session.rooms ?? defaults?.rooms ?? '')
  const [preferences, setPreferences] = useState<string[]>(session.preferences.length ? session.preferences : defaults?.preferences ?? [])
  const [result, setResult] = useState<AiSearchModalApplyPayload | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const canSubmit = useMemo(() => {
    if (mode === 'quick') return Boolean(query.trim().length > 2)
    return Boolean(city.trim())
  }, [mode, query, city])

  const togglePreference = (value: string) => {
    setPreferences((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  const handlePick = () => {
    const input: AiSearchInput = {
      text: mode === 'quick' ? query : '',
      filters: {
        city: city || undefined,
        dateFrom: dateFrom || undefined,
        budgetMax: budgetMax === '' ? undefined : Number(budgetMax),
        guests,
        rooms: rooms === '' ? undefined : Number(rooms),
        preferences,
      },
    }
    const ai = aiSearch(input, defaults ?? {}, listings)
    const payload: AiSearchModalApplyPayload = { parsed: ai.parsed, items: ai.items }
    setResult(payload)
    session.updateSession({
      city: ai.parsed.city ?? '',
      dateFrom: ai.parsed.dateFrom ?? '',
      dateTo: ai.parsed.dateTo ?? '',
      budgetMin: ai.parsed.budgetMin ?? null,
      budgetMax: ai.parsed.budgetMax ?? null,
      guests: ai.parsed.guests ?? 2,
      rooms: ai.parsed.rooms ?? null,
      preferences: ai.parsed.preferences,
      query,
      lastResultCount: ai.items.length,
    })
  }

  if (!open || !hasSlot) return null

  const content = (
    <div className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-auto" style={{ zIndex: 'var(--z-overlay)' }}>
      <div className="overlay" onClick={onClose} aria-hidden />
      <div
        className="modal-panel relative w-full max-h-[92vh] overflow-y-auto rounded-t-[20px] md:rounded-[20px] md:max-w-[560px] md:mx-auto p-5"
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-[20px] font-bold text-[var(--text-main)]">AI-подбор жилья</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-glass)]" aria-label="Закрыть">
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        {!result ? (
          <>
            <div className="grid grid-cols-2 gap-2 rounded-[14px] border border-[var(--border)] p-1 mb-4">
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`h-9 rounded-[10px] text-[13px] font-medium ${mode === 'quick' ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'text-[var(--text-main)]'}`}
              >
                Быстрый
              </button>
              <button
                type="button"
                onClick={() => setMode('step')}
                className={`h-9 rounded-[10px] text-[13px] font-medium ${mode === 'step' ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'text-[var(--text-main)]'}`}
              >
                Пошаговый
              </button>
            </div>

            {mode === 'quick' ? (
              <div className="space-y-3">
                <label className="block text-[13px] text-[var(--text-secondary)]">Опишите, что ищете</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                  placeholder="1 комнатная сегодня до 4000 в центре"
                  className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-[14px] text-[var(--text-main)] focus:outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setQuery((prev) => `${prev}${prev ? ' ' : ''}${chip}`)}
                      className="h-8 rounded-full border border-[var(--border)] px-3 text-[12px] text-[var(--text-main)]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[13px] text-[var(--text-secondary)] mb-1">Куда едем?</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-10 rounded-[12px] border border-[var(--border)] px-3 bg-[var(--card-bg)]" placeholder="Москва" />
                </div>
                <div>
                  <label className="block text-[13px] text-[var(--text-secondary)] mb-1">Когда?</label>
                  <input value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full h-10 rounded-[12px] border border-[var(--border)] px-3 bg-[var(--card-bg)]" placeholder="Сегодня" />
                </div>
                <div>
                  <label className="block text-[13px] text-[var(--text-secondary)] mb-1">Бюджет до</label>
                  <input
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value.replace(/[^\d]/g, '')) : '')}
                    className="w-full h-10 rounded-[12px] border border-[var(--border)] px-3 bg-[var(--card-bg)]"
                    placeholder="5000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] text-[var(--text-secondary)] mb-1">Гости</label>
                    <input value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value || '1')))} className="w-full h-10 rounded-[12px] border border-[var(--border)] px-3 bg-[var(--card-bg)]" />
                  </div>
                  <div>
                    <label className="block text-[13px] text-[var(--text-secondary)] mb-1">Комнат</label>
                    <input value={rooms} onChange={(e) => setRooms(e.target.value ? Number(e.target.value) : '')} className="w-full h-10 rounded-[12px] border border-[var(--border)] px-3 bg-[var(--card-bg)]" />
                  </div>
                </div>
                <div>
                  <p className="block text-[13px] text-[var(--text-secondary)] mb-1">Что важно?</p>
                  <div className="flex flex-wrap gap-2">
                    {['центр', 'рядом метро', 'тихо', 'можно с питомцем'].map((pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => togglePreference(pref)}
                        className={`h-8 rounded-full border px-3 text-[12px] ${preferences.includes(pref) ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-main)]'}`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handlePick}
              className="mt-5 w-full h-11 rounded-[14px] bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold disabled:opacity-60"
            >
              Показать варианты
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-[14px] border border-[var(--border)] p-4 bg-[var(--bg-secondary)]">
              <h3 className="text-[18px] font-semibold text-[var(--text-main)]">Мы нашли {result.items.length} вариантов</h3>
              <p className="mt-1 text-[14px] text-[var(--text-secondary)]">Лучшие для вас:</p>
              <div className="mt-2 text-[13px] text-[var(--text-main)]">
                {result.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-1">
                    {item.title || 'Объявление'} — подходит на {item.aiMatchScore}%
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onApply(result)
                  onClose()
                }}
                className="h-11 rounded-[12px] bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold"
              >
                Показать
              </button>
              <button type="button" onClick={() => setResult(null)} className="h-11 rounded-[12px] border border-[var(--border)] text-[var(--text-main)] font-medium">
                Уточнить подбор
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const root = typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : document.body
  return createPortal(content, root)
}

export type { AiSearchModalApplyPayload, AiSearchModalProps }
