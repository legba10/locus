'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'

export interface MobileMenuProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * ТЗ-8: Меню (бургер) — slide left, backdrop rgba(0,0,0,0.4).
 * Закрытие: тап вне, свайп влево, крест внутри.
 */
export function MobileMenu({ open, onClose, children }: MobileMenuProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)

  useEffect(() => {
    if (!open) return
    document.body.classList.add('body-scroll-lock')
    return () => document.body.classList.remove('body-scroll-lock')
  }, [open])

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [open, onClose])

  const handleOverlayClick = () => onClose()

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -60) onClose()
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Закрыть меню"
        className={cn('mobile-menu-overlay', open && 'open')}
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={handleOverlayClick}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        aria-hidden={!open}
      />
      <div
        ref={drawerRef}
        className={cn('drawer mobile-menu', open && 'open')}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-hidden={!open}
      >
        <div className="drawer-inner">{children}</div>
      </div>
    </>
  )
}
