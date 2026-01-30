/**
 * LOCUS Design System Tokens — v4 REAL ESTATE MARKETPLACE
 * 
 * 🎯 PRODUCT GOAL: Real estate marketplace, not AI platform
 * 
 * Priority:
 * 1. Real estate marketplace feeling
 * 2. Density of listings
 * 3. Clear search UX
 * 4. AI as invisible assistant
 * 5. Premium but simple UI
 * 
 * ❗ КРИТИЧНО по ТЗ v4:
 * - Purple ≤ 10% of UI
 * - White + gray ≥ 70%
 * - Dark blocks ≤ 20%
 * - Graphite (#141821), not black
 */

export const LOCUS_COLORS = {
  // ════════════════════════════════════════════════════════════════
  // NEUTRAL UI (70% of interface) — по ТЗ v4
  // ════════════════════════════════════════════════════════════════
  bg: {
    main: '#FFFFFF',
    soft: '#F7F8FA',           // Soft gray по ТЗ v4
    light: '#ECEFF3',          // Light gray по ТЗ v4
    card: '#FFFFFF',
    // Градиенты для секций
    gradient: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)',
    // Radial для связи секций
    radial: 'radial-gradient(800px 400px at 50% 0%, rgba(124,58,237,0.05), transparent 60%)',
  },
  
  // Text — по ТЗ v4
  text: {
    primary: '#1C1F26',        // Graphite по ТЗ v4
    secondary: '#6B7280',      // Вторичный
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // Border
  border: {
    default: '#E5E7EB',
    soft: 'rgba(0, 0, 0, 0.06)',
  },
  
  // ════════════════════════════════════════════════════════════════
  // ACCENT (10% of UI) — Purple ONLY accent
  // ════════════════════════════════════════════════════════════════
  accent: {
    purple: '#7C3AED',
    purpleSoft: 'rgba(124, 58, 237, 0.12)',
    purpleGradient: 'linear-gradient(135deg, #7C3AED 0%, #5B2DCC 100%)',
  },
  
  // ════════════════════════════════════════════════════════════════
  // DARK GRAPHITE (20% of UI) — по ТЗ v4
  // ════════════════════════════════════════════════════════════════
  dark: {
    graphite: '#141821',
    graphiteLight: '#1B2230',
    gradient: 'linear-gradient(180deg, #141821 0%, #1B2230 100%)',
  },
  
  // ════════════════════════════════════════════════════════════════
  // GLASS UI — по ТЗ v4 (search panel доминирует)
  // ════════════════════════════════════════════════════════════════
  glass: {
    bg: 'rgba(255, 255, 255, 0.75)',
    border: 'rgba(255, 255, 255, 0.6)',
    blur: 'blur(22px)',
    shadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
    radius: '20px',
  },
  
  // Semantic
  semantic: {
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
  },
} as const

// ════════════════════════════════════════════════════════════════
// SHADOWS — по ТЗ v3 (мощнее для depth)
// ════════════════════════════════════════════════════════════════
export const LOCUS_SHADOWS = {
  // Базовые
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.10)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.12)',
  
  // Cards по ТЗ v3
  card: '0 6px 24px rgba(0, 0, 0, 0.08)',
  cardHover: '0 20px 60px rgba(0, 0, 0, 0.14)',    // Мощная тень на hover
  
  // Glass по ТЗ v3
  glass: '0 20px 60px rgba(15, 23, 42, 0.12)',
  
  // Dropdown по ТЗ v3
  dropdown: '0 12px 40px rgba(0, 0, 0, 0.12)',
  
  // CTA кнопки
  button: '0 4px 14px rgba(124, 58, 237, 0.25)',
  
  // Footer inner shadow по ТЗ v3
  footerInner: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
} as const

// ════════════════════════════════════════════════════════════════
// BORDER RADIUS — по ТЗ v3
// search: 22px, dropdown: 14px, card: 18px
// ════════════════════════════════════════════════════════════════
export const LOCUS_RADIUS = {
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '18px',
  xl: '22px',
  '2xl': '28px',
  full: '9999px',
  // Semantic по ТЗ v3
  button: '12px',
  input: '14px',
  card: '18px',
  search: '22px',
  dropdown: '14px',
  modal: '24px',
} as const

// Transitions — плавные, premium feel
export const LOCUS_TRANSITIONS = {
  fast: 'all 0.15s ease-out',
  default: 'all 0.2s ease-out',
  slow: 'all 0.3s ease-out',
  spring: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Hover lift для карточек
  lift: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
} as const

// ════════════════════════════════════════════════════════════════
// GLASSMORPHISM BLUR — iOS style (18px для real glass)
// ════════════════════════════════════════════════════════════════
export const LOCUS_BLUR = {
  sm: 'blur(10px)',
  md: 'blur(18px)',         // Основной glass
  lg: 'blur(24px)',
  xl: 'blur(32px)',
} as const

// ════════════════════════════════════════════════════════════════
// TYPOGRAPHY SCALE — по ТЗ v3
// H1: 44px, H2: 28px, H3: 20px, body: 15px, small: 13px
// Line-height: headings 1.1-1.2, body 1.6
// ════════════════════════════════════════════════════════════════
export const LOCUS_TYPOGRAPHY = {
  // Headings по ТЗ v3
  h1: 'text-[36px] md:text-[44px] font-bold leading-[1.1] tracking-tight',
  h2: 'text-[24px] md:text-[28px] font-bold leading-[1.15] tracking-tight',
  h3: 'text-[18px] md:text-[20px] font-semibold leading-[1.2]',
  
  // Body по ТЗ v3
  body: 'text-[15px] leading-[1.6]',
  bodySmall: 'text-[14px] leading-[1.5]',
  
  // Small text по ТЗ v3
  small: 'text-[13px] leading-[1.4]',
  caption: 'text-[12px] leading-[1.4]',
  
  // Labels
  label: 'text-[13px] font-medium',
  
  // Prices — 20px по ТЗ v3
  price: 'text-[20px] font-bold',
  priceLarge: 'text-[24px] font-bold',
} as const

// ════════════════════════════════════════════════════════════════
// CSS VARIABLES — для использования в CSS/Tailwind
// ════════════════════════════════════════════════════════════════
export const CSS_VARIABLES = `
  --bg-main: #FFFFFF;
  --bg-soft: #F7F8FA;
  --bg-card: #FFFFFF;
  --bg-gradient: linear-gradient(180deg, #FFFFFF 0%, #F6F7FB 100%);
  
  --text-main: #111827;
  --text-secondary: #6B7280;
  
  --accent-primary: #7C3AED;
  --accent-soft: rgba(124, 58, 237, 0.12);
  
  --border-soft: rgba(0, 0, 0, 0.06);
  --shadow-soft: 0 12px 40px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-card-hover: 0 16px 50px rgba(0, 0, 0, 0.12);
  --shadow-glass: 0 20px 60px rgba(0, 0, 0, 0.12);
  --shadow-dropdown: 0 20px 50px rgba(0, 0, 0, 0.15);
`
