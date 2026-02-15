'use client'

import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

const AMENITIES_VISIBLE = 6

export interface AmenitiesProps {
  items: string[]
}

export function Amenities({ items }: AmenitiesProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? items : items.slice(0, AMENITIES_VISIBLE)
  const hasMore = items.length > AMENITIES_VISIBLE

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
        {visible.map((label, i) => (
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
      {hasMore && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-[14px] font-medium text-[var(--accent)] hover:underline"
          >
            {showAll ? 'Свернуть' : 'Все'}
          </button>
        </div>
      )}
    </div>
  )
}
