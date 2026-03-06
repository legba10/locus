'use client'

import dynamic from 'next/dynamic'

const PageClient = dynamic(() => import('../PageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[40vh] flex items-center justify-center text-[var(--text-muted)]">
      Загрузка...
    </div>
  ),
})

/** TZ-1: /admin/stats — вкладка Статистика */
export default function AdminStatsPage() {
  return <PageClient />
}
