'use client'

import { cn } from '@/shared/utils/cn'

export interface ProfileCardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

/** Карточка профиля: border-radius 16, padding 20, glass. */
export function ProfileCard({ children, className, title }: ProfileCardProps) {
  return (
    <section
      className={cn(
        'rounded-[16px] p-5',
        'bg-[var(--bg-card)]/80 backdrop-blur-xl',
        'border border-[var(--border-main)]',
        'shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
        className
      )}
    >
      {title && (
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
