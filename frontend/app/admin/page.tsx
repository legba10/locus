'use client'

import dynamic from 'next/dynamic'

/** TZ-67: админ-панель не грузится на главной — lazy load при переходе */
const PageClient = dynamic(() => import('./PageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[40vh] flex items-center justify-center text-[var(--text-muted)]">
      Загрузка...
    </div>
  ),
})

export default function AdminPage() {
  return <PageClient />
}
