"use client";

import { cn } from "@/shared/utils/cn";

/** ТЗ №7: статусы бронирования. ожидание / подтверждено / отменено */
export type BookingStatusType = "pending" | "approved" | "cancelled";

const LABELS: Record<BookingStatusType, string> = {
  pending: "Ожидание",
  approved: "Подтверждено",
  cancelled: "Отменено",
};

const STYLES: Record<BookingStatusType, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

/** API status (Prisma BookingStatus) → наш тип */
export function apiBookingStatusToType(api: string | undefined): BookingStatusType {
  if (!api) return "pending";
  const s = String(api).toUpperCase();
  if (s === "CONFIRMED") return "approved";
  if (s === "CANCELED" || s === "CANCELLED") return "cancelled";
  return "pending";
}

export interface BookingStatusProps {
  status: BookingStatusType;
  className?: string;
}

export function BookingStatus({ status, className }: BookingStatusProps) {
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
