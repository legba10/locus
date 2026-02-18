'use client'

import { cn } from '@/shared/utils/cn'

const inputCls = cn(
  'w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)]',
  'text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'
)

export interface StepDescriptionProps {
  title: string
  description: string
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onGenerateDescription?: () => void
}

export function StepDescription({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onGenerateDescription,
}: StepDescriptionProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Заголовок</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={inputCls}
          placeholder="Уютная квартира в центре"
          maxLength={120}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-medium text-[var(--text-muted)]">Описание</label>
          {onGenerateDescription && (
            <button
              type="button"
              onClick={onGenerateDescription}
              className="text-[13px] font-semibold text-[var(--accent)] hover:underline"
            >
              Сгенерировать описание
            </button>
          )}
        </div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={cn(inputCls, 'min-h-[160px] resize-y')}
          placeholder="Опишите жильё, преимущества, транспорт..."
          rows={6}
        />
      </div>
    </div>
  )
}
