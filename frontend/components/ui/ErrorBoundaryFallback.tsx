'use client'

import { useRouter } from 'next/navigation'

/** TZ-67: кнопка «Перезагрузить» без window.location.reload — навигация через router.refresh(). */
export function ErrorBoundaryFallback() {
  const router = useRouter()
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center"
      style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}
    >
      <h1 className="text-xl font-semibold">Что-то пошло не так</h1>
      <p className="text-[var(--text-muted)] max-w-md">
        Произошла ошибка. Попробуйте перезагрузить страницу.
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="px-4 py-2 rounded-lg font-medium transition-colors"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-contrast)',
        }}
      >
        Перезагрузить
      </button>
    </div>
  )
}
