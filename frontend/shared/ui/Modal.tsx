'use client'

import * as React from 'react'
import { cn } from '@/shared/utils/cn'
import { Button } from './Button'

export type ModalProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-overlay"
    >
      <div
        className="modal-overlay absolute inset-0"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn('modal-panel w-full max-w-lg rounded-2xl shadow-card')}>
          <div className="flex items-start justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description ? <p className="mt-1 text-sm text-text-mut">{description}</p> : null}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
              Close
            </Button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

