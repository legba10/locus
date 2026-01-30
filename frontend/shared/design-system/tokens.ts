/**
 * LOCUS Design System Tokens — Единая дизайн-система
 * 
 * Используется для:
 * - colors
 * - spacing
 * - radius
 * - shadows
 * - typography
 */

// ════════════════════════════════════════════════════════════════
// COLORS
// ════════════════════════════════════════════════════════════════
export const colors = {
  // Neutral (70% UI)
  neutral: {
    white: '#FFFFFF',
    gray50: '#F7F8FA',
    gray100: '#ECEFF3',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1C1F26',
    gray900: '#111827',
  },
  
  // Brand (не чисто синий, брендовый оттенок)
  brand: {
    // Градиент для логотипа: от темно-серого к фиолетовому
    primary: '#1C1F26', // Graphite
    primaryGradient: 'linear-gradient(135deg, #1C1F26 0%, #374151 50%, #7C3AED 100%)',
    // Muted blue для логотипа (альтернатива)
    mutedBlue: '#4F46E5', // Indigo
    mutedBlueGradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
  },
  
  // Accent (10% UI) - Purple ONLY
  accent: {
    purple: '#7C3AED',
    purpleLight: '#A78BFA',
    purpleDark: '#5B2DCC',
    purpleSoft: 'rgba(124, 58, 237, 0.12)',
    purpleGradient: 'linear-gradient(135deg, #7C3AED 0%, #5B2DCC 100%)',
  },
  
  // Dark (20% UI) - Graphite
  dark: {
    graphite: '#141821',
    graphiteLight: '#1B2230',
    graphiteGradient: 'linear-gradient(180deg, #141821 0%, #1B2230 100%)',
  },
  
  // Semantic
  semantic: {
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    error: '#EF4444',
    errorBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',
  },
} as const

// ════════════════════════════════════════════════════════════════
// SPACING
// ════════════════════════════════════════════════════════════════
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
} as const

// ════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ════════════════════════════════════════════════════════════════
export const radius = {
  none: '0',
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '18px',
  xl: '20px',
  '2xl': '22px',
  '3xl': '24px',
  full: '9999px',
  
  // Semantic
  button: '14px',
  input: '14px',
  card: '18px',
  search: '20px',
  dropdown: '14px',
  modal: '24px',
} as const

// ════════════════════════════════════════════════════════════════
// SHADOWS
// ════════════════════════════════════════════════════════════════
export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.10)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
  
  // Semantic
  card: '0 6px 24px rgba(0, 0, 0, 0.08)',
  cardHover: '0 20px 60px rgba(0, 0, 0, 0.14)',
  glass: '0 20px 60px rgba(0, 0, 0, 0.12)',
  dropdown: '0 12px 40px rgba(0, 0, 0, 0.12)',
  button: '0 4px 14px rgba(124, 58, 237, 0.35)',
  buttonHover: '0 6px 20px rgba(124, 58, 237, 0.45)',
} as const

// ════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ════════════════════════════════════════════════════════════════
export const typography = {
  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '36px',
    '5xl': '44px',
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.1',
    snug: '1.15',
    normal: '1.2',
    relaxed: '1.5',
    loose: '1.6',
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
  },
} as const

// ════════════════════════════════════════════════════════════════
// GLASS UI
// ════════════════════════════════════════════════════════════════
export const glass = {
  bg: 'rgba(255, 255, 255, 0.75)',
  border: 'rgba(255, 255, 255, 0.6)',
  blur: 'blur(22px)',
  shadow: shadows.glass,
  radius: radius.search,
} as const

// ════════════════════════════════════════════════════════════════
// TRANSITIONS
// ════════════════════════════════════════════════════════════════
export const transitions = {
  fast: 'all 0.15s ease-out',
  default: 'all 0.2s ease-out',
  slow: 'all 0.3s ease-out',
  spring: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  lift: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
} as const

// ════════════════════════════════════════════════════════════════
// CSS VARIABLES (для глобального использования)
// ════════════════════════════════════════════════════════════════
export const cssVariables = `
  :root {
    /* Colors */
    --color-neutral-white: ${colors.neutral.white};
    --color-neutral-gray-50: ${colors.neutral.gray50};
    --color-neutral-gray-100: ${colors.neutral.gray100};
    --color-neutral-gray-500: ${colors.neutral.gray500};
    --color-neutral-gray-800: ${colors.neutral.gray800};
    
    --color-brand-primary: ${colors.brand.primary};
    --color-brand-muted-blue: ${colors.brand.mutedBlue};
    
    --color-accent-purple: ${colors.accent.purple};
    --color-accent-purple-soft: ${colors.accent.purpleSoft};
    
    --color-dark-graphite: ${colors.dark.graphite};
    
    /* Spacing */
    --spacing-1: ${spacing[1]};
    --spacing-2: ${spacing[2]};
    --spacing-4: ${spacing[4]};
    --spacing-6: ${spacing[6]};
    --spacing-8: ${spacing[8]};
    
    /* Radius */
    --radius-button: ${radius.button};
    --radius-card: ${radius.card};
    --radius-search: ${radius.search};
    
    /* Shadows */
    --shadow-card: ${shadows.card};
    --shadow-card-hover: ${shadows.cardHover};
    --shadow-glass: ${shadows.glass};
    
    /* Typography */
    --font-size-base: ${typography.fontSize.base};
    --font-size-md: ${typography.fontSize.md};
    --font-weight-semibold: ${typography.fontWeight.semibold};
    --font-weight-bold: ${typography.fontWeight.bold};
  }
`
