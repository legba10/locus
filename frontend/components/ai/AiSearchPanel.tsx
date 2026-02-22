'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { AI_SEARCH_QUICK_HINTS, buildSearchStorePatchFromAi, parseQuickHintToAi, type AiSearchAnswers } from '@/ai/aiSearch'
import { useAiController } from '@/ai/aiController'

interface AiSearchPanelProps {
  open: boolean
  onClose: () => void
  onApply: (patch: ReturnType<typeof buildSearchStorePatchFromAi>) => void
}

const defaults: AiSearchAnswers = {
  city: '',
  budget: null,
  duration: null,
  people: null,
  pets: false,
  when: null,
  checkIn: '',
  checkOut: '',
  type: null,
}

export function AiSearchPanel({ open, onClose, onApply }: AiSearchPanelProps) {
  const ai = useAiController()
  const [answers, setAnswers] = useState<AiSearchAnswers>(defaults)

  const canApply = useMemo(() => {
    return (
      answers.city.trim().length > 0 ||
      answers.budget != null ||
      answers.duration != null ||
      answers.people != null ||
      answers.pets ||
      answers.when != null ||
      answers.type != null
    )
  }, [answers])

  return (
    <Drawer open={open} onClose={onClose} side="right" width={460}>
      <div className="h-full flex flex-col bg-[var(--bg-card)]">
        <div className="p-4 border-b border-[var(--border-main)] flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">AI-подбор</h3>
            <p className="text-[12px] text-[var(--text-secondary)]">
              {ai.demo ? 'AI временно работает в демо-режиме' : 'AI подключен'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-[10px] border border-[var(--border-main)]">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {AI_SEARCH_QUICK_HINTS.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, ...parseQuickHintToAi(hint) }))}
                className="h-8 rounded-full border border-[var(--border-main)] px-3 text-[12px] text-[var(--text-primary)]"
              >
                {hint}
              </button>
            ))}
          </div>

          <Field label="1. Где ищете">
            <input value={answers.city} onChange={(e) => setAnswers((p) => ({ ...p, city: e.target.value }))} className="input-ai" placeholder="Москва" />
          </Field>
          <Field label="2. Бюджет">
            <input value={answers.budget ?? ''} onChange={(e) => setAnswers((p) => ({ ...p, budget: e.target.value ? Number(e.target.value) : null }))} className="input-ai" placeholder="до 80000" />
          </Field>
          <Field label="3. Срок">
            <select value={answers.duration ?? ''} onChange={(e) => setAnswers((p) => ({ ...p, duration: e.target.value || null }))} className="input-ai">
              <option value="">Любой</option>
              <option value="daily">Посуточно</option>
              <option value="long">На месяц</option>
            </select>
          </Field>
          <Field label="4. Кол-во людей">
            <input value={answers.people ?? ''} onChange={(e) => setAnswers((p) => ({ ...p, people: e.target.value ? Number(e.target.value) : null }))} className="input-ai" placeholder="2" />
          </Field>
          <label className="flex items-center gap-2 text-[14px] text-[var(--text-primary)]">
            <input type="checkbox" checked={answers.pets} onChange={(e) => setAnswers((p) => ({ ...p, pets: e.target.checked }))} />
            5. С животными
          </label>
          <Field label="6. Сегодня/даты">
            <select
              value={answers.when ?? ''}
              onChange={(e) => {
                const value = e.target.value as '' | 'today' | 'dates'
                setAnswers((p) => ({ ...p, when: value || null }))
              }}
              className="input-ai"
            >
              <option value="">Не важно</option>
              <option value="today">Сегодня</option>
              <option value="dates">Конкретные даты</option>
            </select>
          </Field>
          {answers.when === 'dates' && (
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={answers.checkIn ?? ''} onChange={(e) => setAnswers((p) => ({ ...p, checkIn: e.target.value }))} className="input-ai" />
              <input type="date" value={answers.checkOut ?? ''} onChange={(e) => setAnswers((p) => ({ ...p, checkOut: e.target.value }))} className="input-ai" />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border-main)]">
          <button
            type="button"
            disabled={!canApply}
            onClick={() => {
              onApply(buildSearchStorePatchFromAi(answers))
              onClose()
            }}
            className="w-full h-11 rounded-[12px] bg-[var(--accent)] text-[var(--text-on-accent)] font-semibold disabled:opacity-60"
          >
            Показать варианты
          </button>
        </div>
      </div>
      <style jsx>{`
        .input-ai {
          width: 100%;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border-main);
          background: var(--bg-input);
          color: var(--text-primary);
          padding: 0 12px;
          font-size: 14px;
        }
      `}</style>
    </Drawer>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[12px] text-[var(--text-muted)]">{label}</p>
      {children}
    </div>
  )
}
