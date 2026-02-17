"use client";

import { useState, useRef } from "react";
import { cn } from "@/shared/utils/cn";
import type { ListingPhotoTag } from "./photo-upload-types";
import { PHOTO_TAG_LABELS } from "./photo-upload-types";
import { PhotoTagModal } from "./PhotoTagModal";

export interface PhotoCardProps {
  id: string;
  preview: string;
  tag: ListingPhotoTag;
  isCover: boolean;
  onTagChange: (tag: ListingPhotoTag) => void;
  onSetCover: () => void;
  onRemove: () => void;
  className?: string;
}

/**
 * ТЗ: карточка фото — клик открывает модалку типа помещения, label в левом нижнем углу (фиолетовый).
 * Hover: кнопка «Изменить» / «Сделать обложкой». Кнопка под фото открывает ту же модалку (исправление «Другое»).
 */
export function PhotoCard({
  id,
  preview,
  tag,
  isCover,
  onTagChange,
  onSetCover,
  onRemove,
  className,
}: PhotoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    openModal();
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(openModal, 400);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const labelText = isCover ? "Обложка" : PHOTO_TAG_LABELS[tag];

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col rounded-[12px] overflow-hidden bg-[var(--bg-input)] border-2 transition-colors",
          isCover ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30" : "border-[var(--border-main)]",
          className
        )}
      >
        <div
          className="relative aspect-square overflow-hidden cursor-pointer"
          onClick={handleCardClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <img
            src={preview}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Label в левом нижнем углу, фиолетовый */}
          <div className="absolute bottom-1 left-1 rounded bg-[var(--accent)] text-[var(--text-on-accent)] px-1.5 py-0.5 text-[10px] font-medium">
            {labelText}
          </div>
          {/* Hover overlay: Изменить / Сделать обложкой */}
          <div
            className={cn(
              "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
            )}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="rounded-full bg-black/60 hover:bg-black/70 text-[var(--text-on-accent)] w-8 h-8 flex items-center justify-center text-[14px] leading-none"
              aria-label="Удалить"
            >
              ×
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openModal(); }}
              className="rounded-lg bg-[var(--accent)] text-[var(--text-on-accent)] px-2 py-1 text-[11px] font-medium"
            >
              Изменить
            </button>
            {!isCover && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSetCover(); }}
                className="rounded-lg bg-white/90 text-[var(--text-main)] px-2 py-1 text-[11px] font-medium"
              >
                Сделать обложкой
              </button>
            )}
          </div>
        </div>
        {/* Кнопка под фото — открывает модалку (исправление «Другое» и смена типа) */}
        <div className="p-1.5">
          <button
            type="button"
            onClick={openModal}
            className={cn(
              "w-full rounded-lg border px-2 py-1.5 text-left text-[12px] font-medium transition-colors",
              "border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)]",
              "hover:bg-[var(--bg-card)]"
            )}
          >
            <span className="block truncate">{labelText}</span>
          </button>
        </div>
      </div>

      <PhotoTagModal
        open={modalOpen}
        onClose={closeModal}
        currentTag={tag}
        isCover={isCover}
        onSelectTag={onTagChange}
        onSetCover={onSetCover}
      />
    </>
  );
}
