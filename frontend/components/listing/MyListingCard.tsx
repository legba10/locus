"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import { StatusBadge, apiStatusToBadge, type ListingStatusBadge } from "./StatusBadge";

export interface MyListingCardData {
  id: string;
  title: string;
  price: number;
  cover: string | null;
  status: string;
  createdAt?: string;
  /** ТЗ-20.2: просмотры, бронирования, доход */
  viewsCount?: number | null;
  bookingsCount?: number | null;
  income?: number | null;
  /** ТЗ-20.3: AI анализ — спрос, цена рынка, рекомендации */
  aiDemand?: string | null;
  aiMarketPrice?: string | number | null;
  aiRecommendations?: string[] | null;
}

export interface MyListingCardProps {
  listing: MyListingCardData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onHide: (id: string) => void;
  onStats?: (id: string) => void;
  className?: string;
}

function formatDate(value: string | undefined): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function MyListingCard({ listing, onEdit, onDelete, onHide, onStats, className }: MyListingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const statusBadge = apiStatusToBadge(listing.status);
  const coverUrl = listing.cover || null;

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <article
      className={cn(
        "rounded-[16px] p-3 sm:p-[12px]",
        "bg-[var(--bg-card)] border border-[var(--border-main)]",
        "flex items-stretch gap-3",
        className
      )}
    >
      {/* Фото: 96×96, radius 12, placeholder если нет */}
      <div className="shrink-0 w-[96px] h-[96px] rounded-[12px] overflow-hidden bg-[var(--bg-input)]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="w-full h-full object-cover"
            width={96}
            height={96}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[24px]"
            aria-hidden
          >
            📷
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
            {listing.title || "Без названия"}
          </h3>
          <p className="text-[14px] text-[var(--text-primary)] mt-0.5">
            {listing.price ? `${listing.price.toLocaleString("ru-RU")} ₽/ночь` : "—"}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <StatusBadge status={statusBadge} />
            {listing.createdAt && (
              <span className="text-[12px] text-[var(--text-secondary)]">
                {formatDate(listing.createdAt)}
              </span>
            )}
          </div>
          {(listing.viewsCount != null || listing.bookingsCount != null || listing.income != null) && (
            <div className="flex flex-wrap gap-3 mt-2 text-[12px] text-[var(--text-muted)]">
              {listing.viewsCount != null && <span>Просмотры: {listing.viewsCount}</span>}
              {listing.bookingsCount != null && <span>Брони: {listing.bookingsCount}</span>}
              {listing.income != null && <span>Доход: {Number(listing.income).toLocaleString("ru-RU")} ₽</span>}
            </div>
          )}
          {/* ТЗ-20.3: AI анализ — спрос, цена рынка, рекомендации */}
          {(listing.aiDemand || listing.aiMarketPrice != null || (listing.aiRecommendations?.length ?? 0) > 0) && (
            <div className="mt-2 pt-2 border-t border-[var(--border-main)] text-[12px]">
              <p className="font-medium text-[var(--text-secondary)] mb-1">AI анализ</p>
              <div className="space-y-0.5 text-[var(--text-muted)]">
                {listing.aiDemand && <p>Спрос: {listing.aiDemand}</p>}
                {listing.aiMarketPrice != null && <p>Цена рынка: {typeof listing.aiMarketPrice === 'number' ? `${listing.aiMarketPrice.toLocaleString('ru-RU')} ₽` : listing.aiMarketPrice}</p>}
                {listing.aiRecommendations?.length ? (
                  <p>Рекомендации: {listing.aiRecommendations.slice(0, 2).join('; ')}</p>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Действия: редактировать, статистика; десктоп — кнопки, mobile — меню */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(listing.id)}
              className="px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors"
            >
              Редактировать
            </button>
            {onStats && (
              <button
                type="button"
                onClick={() => onStats(listing.id)}
                className="px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors"
              >
                Статистика
              </button>
            )}
            <button
              type="button"
              onClick={() => onHide(listing.id)}
              className="px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors"
            >
              Скрыть
            </button>
            <button
              type="button"
              onClick={() => onDelete(listing.id)}
              className="px-3 py-1.5 rounded-[10px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Удалить
            </button>
          </div>

          {/* Mobile: три точки меню */}
          <div className="sm:hidden relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="6" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="18" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 py-1 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-main)] shadow-lg z-10 min-w-[160px]"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onEdit(listing.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                >
                  Редактировать
                </button>
                {onStats && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { onStats(listing.id); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  >
                    Статистика
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onHide(listing.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                >
                  Скрыть
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { onDelete(listing.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 dark:text-red-400 hover:bg-[var(--bg-input)]"
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
