/**
 * Единая UI-тема LOCUS (ТЗ-1: восстановление дизайн-системы).
 * Фирменный фиолетовый градиент, тёмные карточки, единые границы.
 */
export const theme = {
  gradient: 'from-violet-600 to-indigo-600',
  /** Класс для основных кнопок */
  buttonPrimary: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-95 transition-opacity',
  bg: '#0B0F1A',
  card: '#111827',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  subtext: '#9CA3AF',
  /** Классы для карточек объявлений (dark) */
  cardClasses: 'bg-[#111827] border border-white/10 rounded-2xl backdrop-blur',
} as const
