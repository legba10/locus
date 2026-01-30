/**
 * LOCUS Design System — Spacing
 * 
 * Принцип: единые отступы везде
 */

export const spacing = {
  // Базовая единица: 4px
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
} as const

// Border radius
export const radius = {
  none: '0',
  sm: '0.25rem',    // 4px — мелкие элементы
  DEFAULT: '0.5rem', // 8px — кнопки, инпуты
  lg: '0.75rem',    // 12px — карточки
  xl: '1rem',       // 16px — большие карточки
  full: '9999px',   // круг
} as const

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
} as const
