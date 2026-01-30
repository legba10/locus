import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

export type LinkCardProps = {
  href: string
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}

/**
 * IMPORTANT: Link is the root clickable element (no nested click traps).
 */
export function LinkCard({ href, className, children, ...rest }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-2xl border border-border bg-surface-2 shadow-card transition',
        'hover:bg-white/5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.40)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/80 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  )
}

