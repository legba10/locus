"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";

export interface BookingsEmptyStateProps {
  className?: string;
}

/** ТЗ №7: пустое состояние страницы бронирований. */
export function BookingsEmptyState({ className }: BookingsEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        "bg-[var(--bg-card)] rounded-[18px] border border-[var(--border-main)]",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[28px] mb-4" aria-hidden>
        📅
      </div>
      <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">
        У вас пока нет бронирований
      </h2>
      <p className="text-[14px] text-[var(--text-secondary)] mb-6 max-w-[280px]">
        Когда появятся — они будут здесь
      </p>
      <Link
        href="/listings"
        className={cn(
          "inline-flex items-center justify-center px-6 py-3 rounded-[14px]",
          "font-semibold text-[15px] text-[var(--text-on-accent)] bg-[var(--accent)]",
          "hover:opacity-95 transition-opacity"
        )}
      >
        Перейти к объявлениям
      </Link>
    </div>
  );
}
