"use client";

import { cn } from "@/shared/utils/cn";
import type { ListingPhotoTag } from "./photo-upload-types";
import { PhotoTagSelect } from "./PhotoTagSelect";

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
 * ТЗ №4: карточка фото — квадрат, радиус 12, hover overlay.
 * [изображение] [tag selector] [сделать обложкой] [удалить]
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
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[12px] overflow-hidden bg-[var(--bg-input)] border-2 transition-colors",
        isCover ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30" : "border-[var(--border-main)]",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden">
        {/* img для blob/object URL (Next/Image с ними не работает) */}
        <img
          src={preview}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          )}
        >
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full bg-black/60 hover:bg-black/70 text-[var(--text-on-accent)] w-8 h-8 flex items-center justify-center text-[14px] leading-none"
            aria-label="Удалить"
          >
            ×
          </button>
          {!isCover && (
            <button
              type="button"
              onClick={onSetCover}
              className="rounded-lg bg-[var(--accent)] text-[var(--text-on-accent)] px-2 py-1 text-[11px] font-medium"
            >
              Сделать обложкой
            </button>
          )}
        </div>
        {isCover && (
          <div className="absolute bottom-1 left-1 rounded bg-[var(--accent)] text-[var(--text-on-accent)] px-1.5 py-0.5 text-[10px] font-medium">
            Обложка
          </div>
        )}
      </div>
      <div className="p-1.5">
        <PhotoTagSelect
          value={tag}
          isCover={isCover}
          onChangeTag={onTagChange}
          onSetCover={onSetCover}
        />
      </div>
    </div>
  );
}
