"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import type { ListingPhotoTag } from "./photo-upload-types";
import { ROOM_TYPE_OPTIONS } from "./photo-upload-types";

export interface PhotoTagModalProps {
  open: boolean;
  onClose: () => void;
  currentTag: ListingPhotoTag;
  isCover: boolean;
  onSelectTag: (tag: ListingPhotoTag) => void;
  onSetCover: () => void;
}

/**
 * ТЗ: модалка выбора типа помещения при клике на фото.
 * Выберите тип помещения → чипы типов → Сделать обложкой → Сохранить.
 */
export function PhotoTagModal({
  open,
  onClose,
  currentTag,
  isCover,
  onSelectTag,
  onSetCover,
}: PhotoTagModalProps) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[var(--z-modal)] bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-tag-modal-title"
        className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-xl"
      >
        <h2 id="photo-tag-modal-title" className="text-[16px] font-semibold text-[var(--text-main)] mb-1">
          Выберите тип помещения
        </h2>
        <p className="text-[13px] text-[var(--text-secondary)] mb-4">
          (можно изменить позже)
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {ROOM_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectTag(opt.value)}
              className={cn(
                "rounded-[10px] border px-3 py-2 text-[13px] font-medium transition-colors",
                currentTag === opt.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--bg-card)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={isCover}
            onChange={(e) => e.target.checked && onSetCover()}
            className="rounded border-[var(--border)] text-[var(--accent)]"
          />
          <span className="text-[14px] text-[var(--text-main)]">Сделать обложкой</span>
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-[14px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-input)]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-[14px] font-medium text-[var(--text-on-accent)] hover:opacity-95"
          >
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}
