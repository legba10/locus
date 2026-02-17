'use client'

import { cn } from '@/shared/utils/cn'

export interface ListingSpecsProps {
  /** Строки: «2 комнаты», «45 м²», «3 этаж», «есть кухня» и т.д. */
  items: string[]
  className?: string
}

/** ТЗ №10: характеристики — grid 2 колонки, карточки. */
export function ListingSpecs({ items, className }: ListingSpecsProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {items.map((line, i) => (
        <div
          key={i}
          className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-3"
        >
          <p className="text-[14px] font-medium text-[var(--text-primary)]">{line}</p>
        </div>
      ))}
    </div>
  )
}
