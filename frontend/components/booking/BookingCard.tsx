"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { BookingStatus, apiBookingStatusToType, type BookingStatusType } from "./BookingStatus";

export interface BookingCardData {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPhoto: string | null;
  date: string;
  status: string;
}

export interface BookingCardProps {
  booking: BookingCardData;
  onCancel?: (id: string) => void;
  className?: string;
}

function formatDateRange(value: string): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

/** Форматирует checkIn–checkOut в одну строку */
export function formatBookingDates(checkIn: string, checkOut: string): string {
  const from = formatDateRange(checkIn);
  const to = formatDateRange(checkOut);
  return from && to ? `${from} — ${to}` : from || to || "";
}

export function BookingCard({ booking, onCancel, className }: BookingCardProps) {
  const statusType = apiBookingStatusToType(booking.status);
  const canCancel = statusType === "pending" && onCancel;

  return (
    <article
      className={cn(
        "rounded-[16px] p-3 sm:p-[12px]",
        "bg-[var(--bg-card)] border border-[var(--border-main)]",
        "flex items-stretch gap-3",
        className
      )}
    >
      <div className="shrink-0 w-[88px] h-[88px] rounded-[12px] overflow-hidden bg-[var(--bg-input)]">
        {booking.listingPhoto ? (
          <img
            src={booking.listingPhoto}
            alt=""
            className="w-full h-full object-cover"
            width={88}
            height={88}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[22px]"
            aria-hidden
          >
            📷
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] line-clamp-2">
          {booking.listingTitle || "Без названия"}
        </h3>
        <p className="text-[13px] text-[var(--text-secondary)]">
          {booking.date}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <BookingStatus status={statusType} />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Link
            href={`/listings/${booking.listingId}`}
            className={cn(
              "inline-flex items-center justify-center px-4 py-2 rounded-[10px]",
              "text-[13px] font-medium text-[var(--text-on-accent)] bg-[var(--accent)]",
              "hover:opacity-95 transition-opacity w-full sm:w-auto"
            )}
          >
            Открыть
          </Link>
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking.id)}
              className={cn(
                "inline-flex items-center justify-center px-4 py-2 rounded-[10px]",
                "text-[13px] font-medium text-[var(--text-secondary)]",
                "border border-[var(--border-main)] bg-[var(--bg-input)]",
                "hover:bg-[var(--bg-card)] transition-colors w-full sm:w-auto"
              )}
            >
              Отменить
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
