"use client";

import { cn } from "@/shared/utils/cn";

export type ListingMode = "fast" | "manual";

export interface ModeSelectProps {
  onSelectFast: () => void;
  onSelectManual: () => void;
}

/**
 * ТЗ №5: экран выбора режима размещения.
 * «Как разместить объявление?» — две карточки: Быстро через фото / Создать вручную.
 */
export function ModeSelect({ onSelectFast, onSelectManual }: ModeSelectProps) {
  return (
    <div className="py-4">
      <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-6">
        Как разместить объявление?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onSelectFast}
          className={cn(
            "rounded-[18px] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-input)] p-8 text-center transition-colors text-left",
            "hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:border-solid"
          )}
        >
          <span className="text-[32px] mb-3 block">📷</span>
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
            Быстро через фото
          </span>
          <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
            AI заполнит объявление
          </p>
        </button>
        <button
          type="button"
          onClick={onSelectManual}
          className={cn(
            "rounded-[18px] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-input)] p-8 text-center transition-colors text-left",
            "hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:border-solid"
          )}
        >
          <span className="text-[32px] mb-3 block">✍️</span>
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
            Создать вручную
          </span>
          <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
            Заполнить всё самому
          </p>
        </button>
      </div>
    </div>
  );
}
