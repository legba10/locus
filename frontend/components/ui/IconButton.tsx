'use client'

import { cn } from '@/shared/utils/cn'

/**
 * ТЗ №2: универсальная кнопка-иконка в header.
 * Размер 44×44px, иконка внутри 20–22px, borderRadius 12px.
 */
export interface IconButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  ariaLabel?: string
  type?: 'button' | 'submit'
  as?: 'button' | 'a'
  href?: string
}

export default function IconButton({
  children,
  onClick,
  className,
  ariaLabel,
  type = 'button',
  as: Component = 'button',
  href,
}: IconButtonProps) {
  const style = {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-main)',
  } as React.CSSProperties

  const common = {
    style,
    className: cn(
      'shrink-0 text-[var(--text-primary)] hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
      className
    ),
    'aria-label': ariaLabel,
  }

  if (Component === 'a' && href) {
    return (
      <a href={href} {...common}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} {...common}>
      {children}
    </button>
  )
}
