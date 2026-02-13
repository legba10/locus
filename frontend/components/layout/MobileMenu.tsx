'use client'

import { cn } from '@/shared/utils/cn'

export interface MobileMenuProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * ТЗ-2: Мобильное меню — панель slide left.
 * Overlay рендерится в Header только при open. Здесь только панель, без aria-hidden на overlay.
 */
export function MobileMenu({ open, onClose, children }: MobileMenuProps) {
  return (
    <div className={cn('drawer mobile-menu', open && 'open')}>
      <div className="drawer-inner">{children}</div>
    </div>
  )
}
