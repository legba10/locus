'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** max height, e.g. 90vh or 400px */
  maxHeight?: string
  className?: string
}

export function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = '85vh',
  className,
}: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null
  if (typeof document === 'undefined' || !mounted) return null

  const content = (
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex: 'var(--z-overlay)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="overlay" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'relative flex flex-col rounded-t-[24px] border-t border-[var(--border)] bg-[var(--bg-glass)] shadow-[var(--shadow-modal)]',
          'backdrop-blur-[20px] text-[var(--text-main)] overflow-hidden',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
        style={{
          maxHeight,
          zIndex: 'var(--z-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
