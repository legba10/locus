'use client'

import { cn } from '@/shared/utils/cn'

export interface ListingInfoProps {
  title: string
  /** Город • Район */
  subtitle?: string
  className?: string
}

/** ТЗ №10: основная информация — название, локация. */
export function ListingInfo({ title, subtitle, className }: ListingInfoProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <h1 className="text-[20px] font-semibold text-[var(--text-primary)] leading-tight">
        {title || 'Без названия'}
      </h1>
      {subtitle && (
        <p className="text-[14px] text-[var(--text-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
  )
}
