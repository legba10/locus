import { Suspense } from 'react'
import MessagesClient from './MessagesClient'

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--card-bg)]">
        <div className="text-[14px] text-[var(--text-secondary)]">Загрузка…</div>
      </div>
    }>
      <MessagesClient />
    </Suspense>
  )
}
