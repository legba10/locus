'use client'

import { Drawer } from '@/components/ui/Drawer'
import { getAiAdminMockReviewMetrics } from '@/ai/aiAdmin'
import { useAiController } from '@/ai/aiController'

interface AiAdminPanelProps {
  open: boolean
  onClose: () => void
}

export function AiAdminPanel({ open, onClose }: AiAdminPanelProps) {
  const ai = useAiController()
  const metrics = getAiAdminMockReviewMetrics()

  return (
    <Drawer open={open} onClose={onClose} side="right" width={460}>
      <div className="h-full flex flex-col bg-[var(--bg-card)]">
        <div className="p-4 border-b border-[var(--border-main)] flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">AI-анализ администратора</h3>
            <p className="text-[12px] text-[var(--text-secondary)]">
              {ai.demo ? 'AI временно работает в демо-режиме' : 'AI подключен'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-[10px] border border-[var(--border-main)]">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[12px] border border-emerald-500/40 bg-emerald-500/10 p-3">
              <p className="text-[12px] text-emerald-300">Позитив</p>
              <p className="text-[20px] font-semibold text-emerald-200">{metrics.positive}%</p>
            </div>
            <div className="rounded-[12px] border border-red-500/40 bg-red-500/10 p-3">
              <p className="text-[12px] text-red-300">Негатив</p>
              <p className="text-[20px] font-semibold text-red-200">{metrics.negative}%</p>
            </div>
          </div>
          <div className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] p-3">
            <p className="text-[13px] font-medium text-[var(--text-primary)] mb-1">Проблемы в отзывах</p>
            <ul className="space-y-1 text-[13px] text-[var(--text-primary)]">
              {metrics.commonProblems.map((problem) => (
                <li key={problem}>• {problem}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
