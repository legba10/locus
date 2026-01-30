import Link from 'next/link'
import { cn } from '@/shared/utils/cn'
import { HeaderAuth } from './HeaderAuth'

export function Header({ className }: { className?: string }) {
  return (
    <header className={cn('sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur', className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          LOCUS <span className="text-text-dim">(new)</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-text-mut">
          <Link href="/search" className="hover:text-text">
            Поиск
          </Link>
        </nav>
        <HeaderAuth />
      </div>
    </header>
  )
}

