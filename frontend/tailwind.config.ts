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
        // LOCUS Design System - Calm & Professional
        primary: {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Legacy support
        surface: {
          DEFAULT: '#ffffff',
          2: '#f8fafc',
          3: '#f1f5f9',
        },
        border: '#e2e8f0',
        text: {
          DEFAULT: '#0f172a',
          mut: '#475569',
          dim: '#94a3b8',
        },
        brand: {
          DEFAULT: '#2563eb',
          2: '#059669',
        },
        // Semantic colors
        success: {
          DEFAULT: '#059669',
          light: '#d1fae5',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
        },
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
      },
    },
  },
  plugins: [],
} satisfies Config

