"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/shared/utils/cn";
import { PhotoCard } from "./PhotoCard";
import type { ListingPhotoTag } from "./photo-upload-types";
import { MIN_PHOTOS, MAX_PHOTOS } from "./photo-upload-types";

export type PhotoItem = {
  id: string;
  preview: string;
  tag: ListingPhotoTag;
  isNew: boolean;
};

export interface PhotoUploaderProps {
  /** Фото в порядке отображения (первое = обложка при coverIndex 0) */
  items: PhotoItem[];
  coverIndex: number;
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string, isNew: boolean) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onSetCover: (index: number) => void;
  onTagChange: (id: string, tag: ListingPhotoTag, isNew: boolean) => void;
  validationError?: string | null;
  maxPhotos?: number;
}

/**
 * ТЗ №4: блок загрузки фото — сетка 3 колонки, gap 8px, drag & drop, кнопка «+ добавить фото».
 */
export function PhotoUploader({
  items,
  coverIndex,
  onAddFiles,
  onRemove,
  onReorder,
  onSetCover,
  onTagChange,
  validationError,
  maxPhotos = MAX_PHOTOS,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFromRef = useRef<number | null>(null);

  const canAdd = items.length < maxPhotos;

  const handleDragStart = useCallback(
    (index: number) => {
      dragFromRef.current = index;
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => {
      const from = dragFromRef.current;
      dragFromRef.current = null;
      if (from == null || from === toIndex) return;
      onReorder(from, toIndex);
    },
    [onReorder]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length) onAddFiles(files);
      e.target.value = "";
    },
    [onAddFiles]
  );

  const handleZoneDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer.files ?? []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length) onAddFiles(files);
    },
    [onAddFiles]
  );

  const handleZoneDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[13px] font-medium text-[var(--text-secondary)]">
          Фото (минимум {MIN_PHOTOS}: комната и санузел обязательны)
        </span>
        <span className="text-[12px] text-[var(--text-muted)]">
          {items.length}/{maxPhotos}
        </span>
      </div>

      {validationError && (
        <p className="text-[13px] text-[#ff6b6b]" role="alert">
          {validationError}
        </p>
      )}

      <div
        className="grid gap-2 rounded-[16px] p-0"
        style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className="cursor-grab active:cursor-grabbing"
          >
            <PhotoCard
              id={item.id}
              preview={item.preview}
              tag={item.tag}
              isCover={coverIndex === index}
              onTagChange={(tag) => onTagChange(item.id, tag, item.isNew)}
              onSetCover={() => onSetCover(index)}
              onRemove={() => onRemove(item.id, item.isNew)}
            />
          </div>
        ))}

        {canAdd && (
          <label
            htmlFor="photo-upload-tz4"
            onDragOver={handleZoneDragOver}
            onDrop={handleZoneDrop}
            className={cn(
              "aspect-square rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors",
              "border-[var(--border-main)] bg-[var(--bg-input)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
            )}
          >
            <span className="text-2xl text-[var(--text-muted)]">+</span>
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              добавить фото
            </span>
          </label>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        id="photo-upload-tz4"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
