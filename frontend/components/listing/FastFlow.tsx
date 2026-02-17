"use client";

/**
 * ТЗ №5: поток «Быстро через фото».
 * Реальный порядок: ModeSelect → PhotoUpload → AiLoader → PrefilledForm → Submit.
 * Рендерит только обёртку; логика шагов в ListingWizard.
 */
export function FastFlow({ children }: { children: React.ReactNode }) {
  return <div data-flow="fast">{children}</div>;
}
