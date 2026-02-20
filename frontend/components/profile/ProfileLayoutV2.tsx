'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/shared/utils/cn'
import { ProfileSidebar } from './ProfileSidebar'

/** ТЗ-27: На главной /profile — без сайдбара (единый кабинет). На подстраницах — сайдбар для навигации назад. */
export function ProfileLayoutV2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isProfileRoot = pathname === '/profile' || pathname === '/profile/'

  if (isProfileRoot) {
    return <div className="min-h-screen bg-[var(--bg-main)]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>
          <main className="lg:col-span-3 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
