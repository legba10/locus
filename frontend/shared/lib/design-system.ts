/**
 * ТЗ-MAIN-REDESIGN: дизайн-система продукта.
 * Использовать везде: bg-[var(--bg)], text-[var(--text)], border-[var(--border)].
 */

export const DS = {
  radius: 'rounded-2xl',
  blur: 'backdrop-blur-xl',
  transition: 'transition-all duration-200',
  /** Карточка продукта */
  card: 'rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden',
  /** Кнопка CTA */
  ctaButton:
    'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl h-12 px-6 flex items-center justify-center hover:opacity-95 active:scale-[0.98] transition-all duration-200',
  /** Заголовок секции */
  sectionTitle: 'text-[24px] md:text-[28px] font-bold text-[var(--text)]',
  sectionSub: 'text-[var(--sub)] text-[15px]',
}
