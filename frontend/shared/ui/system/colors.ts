/**
 * LOCUS Design System — Colors
 * 
 * Принцип: минимум цветов, максимум ясности
 */

export const colors = {
  // Primary — основной цвет действий
  primary: {
    DEFAULT: '#2563eb',
    hover: '#1d4ed8',
    light: '#eff6ff',
  },

  // Accent — акцент для AI/подсказок (мягкий, не кричащий)
  accent: {
    DEFAULT: '#059669',
    light: '#ecfdf5',
  },

  // Semantic — понятные значения
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',

  // Neutral — текст и фон
  text: {
    DEFAULT: '#111827',
    secondary: '#6b7280',
    muted: '#9ca3af',
  },

  bg: {
    DEFAULT: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },

  border: {
    DEFAULT: '#e5e7eb',
    light: '#f3f4f6',
  },
} as const

// CSS Variables для использования в Tailwind
export const cssVariables = `
  :root {
    --color-primary: ${colors.primary.DEFAULT};
    --color-primary-hover: ${colors.primary.hover};
    --color-primary-light: ${colors.primary.light};
    --color-accent: ${colors.accent.DEFAULT};
    --color-accent-light: ${colors.accent.light};
    --color-success: ${colors.success};
    --color-warning: ${colors.warning};
    --color-error: ${colors.error};
    --color-text: ${colors.text.DEFAULT};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-muted: ${colors.text.muted};
    --color-bg: ${colors.bg.DEFAULT};
    --color-bg-secondary: ${colors.bg.secondary};
    --color-border: ${colors.border.DEFAULT};
  }
`
