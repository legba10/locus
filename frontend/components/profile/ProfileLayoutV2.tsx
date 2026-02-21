'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

/** TZ-32: Один источник навигации — экран профиля. Без вложенного меню (сайдбара). Подстраницы: только «Назад в профиль» + контент. */
export function ProfileLayoutV2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isProfileRoot = pathname === '/profile' || pathname === '/profile/'

  if (isProfileRoot) {
    return <div className="min-h-screen bg-[var(--bg-main)]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад в профиль
        </Link>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  )
}
