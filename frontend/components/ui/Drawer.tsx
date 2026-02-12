'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'

export type DrawerProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** left | right */
  side?: 'left' | 'right'
  width?: string | number
  className?: string
}

const defaultWidth = 280

export function Drawer({
  open,
  onClose,
  children,
  side = 'left',
  width = defaultWidth,
  className,
}: DrawerProps) {
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

  const w = typeof width === 'number' ? `${width}px` : width
  const isLeft = side === 'left'

  const content = (
    <div
      className="fixed inset-0"
      style={{ zIndex: 'var(--z-drawer)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-[var(--blur-soft)]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'absolute top-0 bottom-0 w-full max-w-[85vw] overflow-y-auto',
          'border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)]',
          'text-[var(--text-primary)] transition-transform duration-300 ease-out',
          isLeft ? 'left-0 border-r' : 'right-0 border-l',
          open ? 'translate-x-0' : isLeft ? '-translate-x-full' : 'translate-x-full',
          className
        )}
        style={{
          width: w,
          zIndex: 'calc(var(--z-drawer) + 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  )

  return createPortal(content, document.body)
}
