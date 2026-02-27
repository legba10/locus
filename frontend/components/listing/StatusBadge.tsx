"use client";

import { cn } from "@/shared/utils/cn";

/** ТЗ №6: статусы объявления на странице «Мои объявления». */
export type ListingStatusBadge =
  | "active"    // активно — зеленый
  | "pending"  // на проверке — оранж
  | "rejected" // отклонено — красный
  | "archived" // архив — muted
  | "draft";   // черновик — серый

/** TZ-65: понятные статусы для пользователя */
const LABELS: Record<ListingStatusBadge, string> = {
  active: "Опубликовано",
  pending: "На модерации",
  rejected: "Отклонено",
  archived: "Архив",
  draft: "Черновик",
};

const STYLES: Record<ListingStatusBadge, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  archived: "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-main)]",
  draft: "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-main)]",
};

/** Маппинг backend status (legacy/new) -> badge */
export function apiStatusToBadge(apiStatus: string | undefined): ListingStatusBadge {
  if (!apiStatus) return "draft";
  const s = String(apiStatus).toUpperCase().trim();
  if (s === "PUBLISHED") return "active";
  if (s === "MODERATION" || s === "PENDING_REVIEW" || s === "AWAITING_PAYMENT") return "pending";
  if (s === "REJECTED") return "rejected";
  if (s === "ARCHIVED" || s === "BLOCKED") return "archived";
  if (s === "DRAFT") return "draft";
  return "draft";
}

export interface StatusBadgeProps {
  status: ListingStatusBadge;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium border",
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}
