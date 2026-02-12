'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { z } from '@/styles/zIndex'
import { cn } from '@/shared/utils/cn'

export type OverlayRootProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** z-index layer: overlay (backdrop) and content above it */
  layer?: keyof typeof z
  /** Backdrop only, no panel styling on children */
  backdropOnly?: boolean
  className?: string
  /** Panel wrapper className when !backdropOnly */
  panelClassName?: string
}

/**
 * ТЗ-3: Единый слой для Modal, Drawer, Notifications, Burger, Bottom sheet.
 * Рендерит в portal: backdrop (theme-aware) + слот для контента.
 * Не использует прозрачность — только var(--overlay-bg) и var(--surface-primary).
 */
export function OverlayRoot({
  open,
  onClose,
  children,
  layer = 'modal',
  backdropOnly = false,
  className,
  panelClassName,
}: OverlayRootProps) {
  const zIndex = z[layer] ?? z.modal
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

  if (!open) return null
  if (typeof window === 'undefined' || !mounted) return null

  const content = backdropOnly ? (
    children
  ) : (
    <div
      className={cn('panel', panelClassName)}
      style={{ zIndex: zIndex + 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )

  return createPortal(
    <div
      className={cn('fixed inset-0 flex items-center justify-center p-4', className)}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="overlay-backdrop"
        style={{ zIndex }}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        tabIndex={0}
        aria-hidden
      />
      {content}
    </div>,
    document.body
  )
}
