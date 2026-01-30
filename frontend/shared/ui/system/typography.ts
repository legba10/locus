/**
 * LOCUS Design System — Typography
 * 
 * Принцип: один font scale, читаемость
 */

export const typography = {
  // Font family
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // Font sizes (rem)
  fontSize: {
    xs: '0.75rem',     // 12px — мелкий текст
    sm: '0.875rem',    // 14px — вторичный текст
    base: '1rem',      // 16px — основной текст
    lg: '1.125rem',    // 18px — подзаголовки
    xl: '1.25rem',     // 20px — заголовки секций
    '2xl': '1.5rem',   // 24px — заголовки страниц
    '3xl': '1.875rem', // 30px — большие заголовки
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const

// Готовые стили текста
export const textStyles = {
  // Заголовки
  h1: 'text-2xl font-bold text-gray-900',
  h2: 'text-xl font-semibold text-gray-900',
  h3: 'text-lg font-semibold text-gray-900',
  
  // Текст
  body: 'text-base text-gray-700',
  bodySmall: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  
  // Цена
  price: 'text-lg font-bold text-gray-900',
  priceSmall: 'text-base font-semibold text-gray-900',
} as const
