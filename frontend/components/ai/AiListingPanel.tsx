'use client'

import { Drawer } from '@/components/ui/Drawer'
import { useMemo } from 'react'
import { runListingAiMock } from '@/ai/aiListing'
import { useAiController } from '@/ai/aiController'

interface AiListingPanelProps {
  open: boolean
  onClose: () => void
  listing: {
    title: string
    description: string
    photosCount: number
    price: number
    city: string
    district?: string | null
    amenities: string[]
    typeLabel: string
  }
  onApplyDescription: (text: string) => void
}

export function AiListingPanel({ open, onClose, listing, onApplyDescription }: AiListingPanelProps) {
  const ai = useAiController()
  const report = useMemo(() => runListingAiMock(listing), [listing])

  return (
    <Drawer open={open} onClose={onClose} side="right" width={480}>
      <div className="h-full flex flex-col bg-[var(--bg-card)]">
        <div className="p-4 border-b border-[var(--border-main)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Улучшить объявление AI</h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                {ai.demo ? 'AI временно работает в демо-режиме' : 'AI подключен'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="w-9 h-9 rounded-[10px] border border-[var(--border-main)]">×</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <section className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
            <p className="text-[12px] text-[var(--text-secondary)]">Оценка AI</p>
            <p className="text-[28px] font-semibold text-[var(--text-primary)]">{report.score}/100</p>
            <ul className="mt-2 space-y-1 text-[13px] text-[var(--text-primary)]">
              {report.issues.length ? report.issues.map((i) => <li key={i}>• {i}</li>) : <li>• Критичных проблем не найдено</li>}
            </ul>
          </section>
          <section className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-3">
            <p className="text-[13px] font-medium text-[var(--text-primary)] mb-1">Подсказки</p>
            <ul className="space-y-1 text-[13px] text-[var(--text-primary)]">
              {report.tips.map((tip) => <li key={tip}>• {tip}</li>)}
            </ul>
          </section>
          <section className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-3">
            <p className="text-[13px] text-[var(--text-secondary)]">Предложенная цена</p>
            <p className="text-[22px] font-semibold text-[var(--text-primary)]">{report.suggestedPrice.toLocaleString('ru-RU')} ₽</p>
          </section>
          <section className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
            <p className="text-[13px] text-[var(--text-secondary)] mb-1">Сгенерированное описание</p>
            <p className="text-[13px] text-[var(--text-primary)] whitespace-pre-wrap">{report.improvedDescription}</p>
          </section>
        </div>
        <div className="p-4 border-t border-[var(--border-main)] grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onApplyDescription(report.improvedDescription)} className="h-10 rounded-[10px] bg-[var(--accent)] text-[var(--text-on-accent)] text-[13px] font-semibold">
            Применить
          </button>
          <button type="button" onClick={onClose} className="h-10 rounded-[10px] border border-[var(--border-main)] text-[var(--text-primary)] text-[13px] font-medium">
            Закрыть
          </button>
        </div>
      </div>
    </Drawer>
  )
}
