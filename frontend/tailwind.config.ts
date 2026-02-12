import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './domains/**/*.{ts,tsx}',
    './shared/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // GLOBAL UI LOCUS (из логотипа). Цвет = смысл.
        locus: {
          primary: '#7B4AE2',     // Главные CTA, AI, активные состояния
          secondary: '#4AA3E2',  // Вторичные действия, иконки
          'accent-light': 'rgba(123, 74, 226, 0.1)',
          'bg-page': '#FFFFFF',
          'bg-card': '#F9F9FB',
          divider: '#ECECEC',
          'text-main': '#1A1A1A',
          'text-secondary': '#6B6B6B',
          danger: '#E14C4C',     // Выйти, ошибки
        },
        // Legacy / alias — ТЗ-1: theme-aware через CSS variables
        primary: { DEFAULT: 'var(--accent)', 50: '#f5f0ff', 100: '#ede5ff', 500: 'var(--accent)', 600: 'var(--accent-hover)', 700: '#5a32b8' },
        surface: { DEFAULT: 'var(--bg-surface)', 2: 'var(--bg-card)', 3: 'var(--bg-surface)' },
        border: 'var(--border-main)',
        text: { DEFAULT: 'var(--text-primary)', mut: 'var(--text-muted)', dim: 'var(--text-secondary)' },
        brand: { DEFAULT: 'var(--accent)', 2: '#4AA3E2' },
        success: { DEFAULT: '#059669', light: '#d1fae5' },
        warning: { DEFAULT: '#d97706', light: '#fef3c7' },
        danger: { DEFAULT: '#E14C4C', light: '#fee2e2' },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'card': 'var(--locus-radius-card)',
        'button': 'var(--locus-radius-button)',
      },
      spacing: {
        'locus-1': 'var(--locus-space-1)',
        'locus-2': 'var(--locus-space-2)',
        'locus-3': 'var(--locus-space-3)',
        'locus-4': 'var(--locus-space-4)',
        'locus-6': 'var(--locus-space-6)',
        'locus-8': 'var(--locus-space-8)',
      },
      fontFamily: {
        sans: ['var(--locus-font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'locus-body': ['0.9375rem', { lineHeight: '1.5' }],
        'locus-caption': ['0.8125rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
} satisfies Config

