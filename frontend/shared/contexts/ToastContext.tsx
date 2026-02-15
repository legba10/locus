'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: (options: { type?: ToastType; message: string }) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 3000

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = React.useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (options: { type?: ToastType; message: string }) => {
      const id = ++idRef.current
      const type = options.type ?? 'info'
      setToasts((prev) => [...prev, { id, type, message: options.message }])
      setTimeout(() => removeToast(id), TOAST_DURATION)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-[var(--z-toast,9999)] flex flex-col gap-2 max-w-[calc(100vw-32px)]"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`
            toast-tz20 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
            ${t.type === 'success' ? 'bg-[var(--bg-card)] border-green-500/30 text-[var(--text-main)]' : ''}
            ${t.type === 'error' ? 'bg-[var(--bg-card)] border-[var(--danger)]/50 text-[var(--text-main)]' : ''}
            ${t.type === 'info' ? 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)]' : ''}
          `}
        >
          <span className="text-[14px] font-medium">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] opacity-70 -m-1"
            aria-label="Закрыть"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { toast: () => {}, toasts: [], removeToast: () => {} }
  return ctx
}
