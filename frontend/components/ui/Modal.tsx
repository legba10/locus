'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'
import { Button } from './Button'

export type ModalProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
  /** ТЗ-4: только токены. Overlay: bg-overlay, backdrop-blur, z-modal, scroll lock */
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
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
    if (open) {
      document.body.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [open])

  if (!open) return null
  if (typeof document === 'undefined' || !mounted) return null

  const content = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-overlay"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      <div
        className="overlay"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-modal)] shadow-[var(--shadow-modal)] modal-panel',
          'text-[var(--text-primary)]'
        )}
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--divider)] p-5">
          <div>
            <h2 className="text-h2">{title}</h2>
            {description ? <p className="text-small mt-1">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Закрыть">
            Закрыть
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
