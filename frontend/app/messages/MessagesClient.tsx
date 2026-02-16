'use client'

import { Suspense } from 'react'
import MessagesInner from './MessagesInner'

/**
 * ТЗ-11: useSearchParams/useRouter должны быть внутри Suspense boundary.
 * MessagesClient — только обёртка; вся логика в MessagesInner.
 */
export default function MessagesClient() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <MessagesInner />
    </Suspense>
  )
}

function MessagesFallback() {
  return (
    <div
      className="flex flex-col bg-[var(--card-bg)] h-full min-h-0"
      style={{ top: 'var(--header-height, 64px)', height: 'calc(100vh - var(--header-height, 64px))' }}
    >
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)] animate-spin" aria-hidden />
      </div>
    </div>
  )
}
