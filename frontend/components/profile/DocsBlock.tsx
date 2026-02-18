'use client'

import { ProfileCard } from './ProfileCard'
import { cn } from '@/shared/utils/cn'

type DocStatus = 'not_uploaded' | 'checking' | 'verified'

const STATUS_LABELS: Record<DocStatus, string> = {
  not_uploaded: 'Не загружено',
  checking: 'Проверяется',
  verified: 'Подтверждено',
}

export function DocsBlock() {
  const items: { label: string; status: DocStatus }[] = [
    { label: 'Паспорт', status: 'not_uploaded' },
    { label: 'Фото лица', status: 'not_uploaded' },
    { label: 'Подтверждение номера', status: 'not_uploaded' },
  ]

  return (
    <div className="space-y-6">
      <ProfileCard title="Документы и верификация">
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.label}
              className={cn(
                'flex items-center justify-between rounded-[12px] p-4 border border-[var(--border-main)]',
                item.status === 'verified' && 'bg-emerald-500/10 border-emerald-500/30',
                item.status === 'checking' && 'bg-amber-500/10 border-amber-500/30'
              )}
            >
              <span className="text-[14px] font-medium text-[var(--text-primary)]">{item.label}</span>
              <span
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[12px] font-medium',
                  item.status === 'verified' && 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
                  item.status === 'checking' && 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
                  item.status === 'not_uploaded' && 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                )}
              >
                {STATUS_LABELS[item.status]}
              </span>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-4 px-4 py-2.5 rounded-[12px] bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold hover:opacity-95">
          Загрузить документы
        </button>
      </ProfileCard>
    </div>
  )
}
