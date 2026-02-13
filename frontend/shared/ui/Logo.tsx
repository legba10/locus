'use client'

import Link from 'next/link'
import { cn } from '@/shared/utils/cn'

interface LogoProps {
  /** primary = тёмный текст, light = белый, accent = градиент, theme = по текущей теме (var(--text-primary)) */
  variant?: 'primary' | 'light' | 'accent' | 'theme'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
  showText?: boolean
}

/**
 * LOCUS Logo Component — ТОЛЬКО ТЕКСТ
 * 
 * По запросу пользователя:
 * - Только надпись LOCUS (без иконки)
 * - Четкий, не тонкий текст
 * - font-weight: 800 (extra bold)
 */
export function Logo({ 
  variant = 'primary', 
  size = 'md',
  className,
  href = '/',
  showText = true
}: LogoProps) {
  // Размеры текста — увеличены для лучшей видимости
  const sizes = {
    sm: { text: 'text-[20px]', weight: 'font-extrabold' },
    md: { text: 'text-[22px]', weight: 'font-extrabold' },
    lg: { text: 'text-[26px]', weight: 'font-extrabold' },
  }

  // Цвета — ТЗ-1: theme = по токену, без жёстких цветов
  const getColors = () => {
    switch (variant) {
      case 'theme':
        return {
          textColor: 'text-[var(--text-primary)]',
          shadow: '',
        }
      case 'light':
        return {
          textColor: 'text-white',
          shadow: 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
        }
      case 'accent':
        return {
          textColor: 'bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent',
          shadow: '',
        }
      case 'primary':
      default:
        return {
          textColor: 'text-[var(--text-primary)]',
          shadow: 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]',
        }
    }
  }

  const colors = getColors()

  const LogoContent = () => (
    <div className="inline-flex items-center">
      {showText && (
        <span className={cn(
          sizes[size].text,
          sizes[size].weight,
          'tracking-[-0.02em] leading-[1.1]', // Более плотный tracking для лучшей читаемости
          'text-rendering: optimizeLegibility',
          '-webkit-font-smoothing: antialiased',
          '-moz-osx-font-smoothing: grayscale',
          variant === 'accent' 
            ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent'
            : colors.textColor,
          colors.shadow,
          'select-none' // Предотвращает выделение текста
        )}>
          LOCUS
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className={cn(
          'inline-flex items-center group',
          'transition-all duration-200',
          'hover:scale-[1.04]',
          'hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]',
          className
        )}
      >
        <LogoContent />
      </Link>
    )
  }

  return (
    <div className={cn('inline-flex items-center', className)}>
      <LogoContent />
    </div>
  )
}

/**
 * LogoIcon — Standalone icon (без текста, без контейнера)
 */
export function LogoIcon({ 
  className,
  variant = 'primary',
  size = 'md'
}: { 
  className?: string
  variant?: 'primary' | 'light'
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  }

  const iconColor = variant === 'light' ? 'rgba(255, 255, 255, 0.8)' : '#111827'
  const accentColor = variant === 'light' ? 'rgba(255, 255, 255, 0.4)' : '#7C3AED'

  return (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      className={cn(sizeClasses[size], className)}
    >
      <path 
        d="M16 2C10.48 2 6 6.48 6 12c0 7 10 18 10 18s10-11 10-18c0-5.52-4.48-10-10-10z"
        fill={iconColor}
      />
      <path 
        d="M16 7L10 12v7h4v-4h4v4h4v-7L16 7z"
        fill={accentColor}
      />
    </svg>
  )
}

/**
 * LogoFavicon — SVG для favicon (graphite + фиолетовый акцент)
 */
export const LOGO_FAVICON_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#0F172A"/>
  <path d="M16 4C11.03 4 7 8.03 7 13c0 6 9 15 9 15s9-9 9-15c0-4.97-4.03-9-9-9z" fill="white"/>
  <path d="M16 8L11 12v6h3v-3h4v3h3v-6L16 8z" fill="#7C3AED"/>
</svg>`
