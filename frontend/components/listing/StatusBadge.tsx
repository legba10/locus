"use client";

import { cn } from "@/shared/utils/cn";

/** ТЗ №6: статусы объявления на странице «Мои объявления». */
export type ListingStatusBadge =
  | "active"    // активно — зеленый
  | "pending"  // на проверке — оранж
  | "hidden"   // скрыто — серый
  | "archived" // архив — muted
  | "draft";   // черновик — серый

const LABELS: Record<ListingStatusBadge, string> = {
  active: "Активно",
  pending: "На проверке",
  hidden: "Скрыто",
  archived: "Архив",
  draft: "Черновик",
};

const STYLES: Record<ListingStatusBadge, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  hidden: "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-main)]",
  archived: "bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-main)]",
  draft: "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-main)]",
};

/** Маппинг бэкенд status → наш badge (Prisma ListingStatus). */
export function apiStatusToBadge(apiStatus: string | undefined): ListingStatusBadge {
  if (!apiStatus) return "draft";
  const s = String(apiStatus).toUpperCase();
  if (s === "PUBLISHED") return "active";
  if (s === "PENDING_REVIEW") return "pending";
  if (s === "ARCHIVED") return "archived";
  if (s === "DRAFT" || s === "REJECTED" || s === "BLOCKED") return s === "DRAFT" ? "draft" : "hidden";
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
