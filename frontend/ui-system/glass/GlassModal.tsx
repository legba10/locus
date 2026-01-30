'use client'

import { Fragment, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

/**
 * GlassModal — Модальное окно в стиле Liquid Glass
 */
export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: GlassModalProps) {
  if (!isOpen) return null

  return (
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'w-full',
            sizeStyles[size],
            'rounded-2xl overflow-hidden',
            'bg-slate-900/90 backdrop-blur-xl',
            'border border-white/[0.15]',
            'shadow-2xl shadow-black/40',
            'animate-slideUp',
            className
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.1]">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors"
                aria-label="Закрыть"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  )
}

/**
 * GlassModalActions — Блок действий модального окна
 */
interface GlassModalActionsProps {
  children: ReactNode
  className?: string
}

export function GlassModalActions({ children, className }: GlassModalActionsProps) {
  return (
    <div className={cn(
      'flex items-center justify-end gap-3 pt-4',
      'border-t border-white/[0.1] mt-4 -mb-2',
      className
    )}>
      {children}
    </div>
  )
}
