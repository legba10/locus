'use client'

import { cn } from '@/shared/utils/cn'

export interface AmenitiesProps {
  items: string[]
}

export function Amenities({ items }: AmenitiesProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 md:p-6">
        <h2 className="text-[18px] font-bold text-[var(--text-main)] mb-4">Удобства</h2>
        <p className="text-[14px] text-[var(--text-secondary)]">Удобства не указаны.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 md:p-6">
      <h2 className="text-[18px] font-bold text-[var(--text-main)] mb-4">Удобства</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((label, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2 py-2.5 px-3 rounded-xl',
              'glass border border-[var(--border)]'
            )}
          >
            <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[13px] font-medium text-[var(--text-main)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
