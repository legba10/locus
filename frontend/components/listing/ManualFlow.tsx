"use client";

/**
 * ТЗ №5: поток «Создать вручную».
 * Реальный порядок: ModeSelect → ManualForm → PhotoUpload → Submit.
 * Рендерит только обёртку; логика шагов в ListingWizard.
 */
export function ManualFlow({ children }: { children: React.ReactNode }) {
  return <div data-flow="manual">{children}</div>;
}
