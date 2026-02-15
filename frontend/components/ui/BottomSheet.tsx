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
  /** ТЗ-4.3: анимация закрытия 300ms (translateY 100% → 0) */
  animateClose?: boolean
}

export function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = '85vh',
  className,
  animateClose = false,
}: BottomSheetProps) {
  const [mounted, setMounted] = React.useState(false)
  const [exiting, setExiting] = React.useState(false)
  const prevOpen = React.useRef(open)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (animateClose && prevOpen.current && !open) {
      setExiting(true)
    }
    prevOpen.current = open
  }, [open, animateClose])

  React.useEffect(() => {
    if (!exiting) return
    const t = setTimeout(() => setExiting(false), 200)
    return () => clearTimeout(t)
  }, [exiting])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  React.useEffect(() => {
    if (open || exiting) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, exiting])

  const visible = open || exiting
  if (!visible) return null
  if (typeof document === 'undefined' || !mounted) return null

  const content = (
    <div
      className={cn(
        'fixed inset-0 flex flex-col justify-end bottom-sheet-tz2',
        (open || exiting) && 'bottom-sheet-tz2-visible'
      )}
      style={{ zIndex: 'var(--z-overlay)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bottom-sheet-tz2-overlay" onClick={onClose} aria-hidden />
      <div
        className={cn(
          'relative flex flex-col rounded-t-[24px] border-t border-[var(--border)] bg-[var(--bg-glass)] shadow-[var(--shadow-modal)]',
          'backdrop-blur-[20px] text-[var(--text-main)] overflow-hidden',
          'bottom-sheet-tz2-panel bottom-sheet-tz5',
          open && !exiting && 'bottom-sheet-tz2-panel--open',
          exiting && 'bottom-sheet-tz2-panel--exiting',
          className
        )}
        style={{
          maxHeight,
          height: open ? maxHeight : undefined,
          zIndex: 'var(--z-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ТЗ-5: при height = maxHeight контент внутри (flex-1 overflow-y-auto) скроллится */}
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
