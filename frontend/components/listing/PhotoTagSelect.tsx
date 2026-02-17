"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import type { ListingPhotoTag } from "./photo-upload-types";
import { PHOTO_TAG_OPTIONS, PHOTO_TAG_LABELS } from "./photo-upload-types";

export interface PhotoTagSelectProps {
  value: ListingPhotoTag;
  isCover: boolean;
  onChangeTag: (tag: ListingPhotoTag) => void;
  onSetCover: () => void;
  className?: string;
}

/**
 * ТЗ №4: под каждым фото dropdown — Обложка, Комната, Кухня, Санузел, Балкон, Другое.
 * При выборе «Обложка» вызывается onSetCover, остальные снимаются с обложки на уровне родителя.
 */
export function PhotoTagSelect({
  value,
  isCover,
  onChangeTag,
  onSetCover,
  className,
}: PhotoTagSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const handleSelect = (option: (typeof PHOTO_TAG_OPTIONS)[number]) => {
    if (option.value === "cover") {
      onSetCover();
    } else {
      onChangeTag(option.value);
    }
    setOpen(false);
  };

  const label = isCover ? "Обложка" : PHOTO_TAG_LABELS[value];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full rounded-lg border px-2 py-1.5 text-left text-[12px] font-medium transition-colors",
          "border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-primary)]",
          "hover:bg-[var(--bg-card)]"
        )}
      >
        <span className="block truncate">{label}</span>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] py-1 shadow-lg"
          role="listbox"
        >
          {PHOTO_TAG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full px-3 py-2 text-left text-[12px] transition-colors",
                "text-[var(--text-primary)] hover:bg-[var(--bg-input)]",
                (opt.value === "cover" ? isCover : opt.value === value) &&
                  "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
