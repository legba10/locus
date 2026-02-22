'use client'

import { useRef } from 'react'
import type { ListingPhotoDraft, PhotoType } from '../listingStore'
import { PHOTO_TYPE_LABELS } from '../photoController'

interface PhotosStepProps {
  photos: ListingPhotoDraft[]
  onAddFiles: (files: File[]) => void
  onSetType: (id: string, type: PhotoType) => void
  onSetCover: (id: string) => void
  onRemove: (id: string) => void
}

const TYPES = Object.entries(PHOTO_TYPE_LABELS) as Array<[PhotoType, string]>

export function PhotosStep({ photos, onAddFiles, onSetType, onSetCover, onRemove }: PhotosStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-dashed border-[var(--border-main)] bg-[var(--bg-input)]/60 p-5 text-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) onAddFiles(files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-[12px] px-4 py-2 bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold"
        >
          Загрузить фото
        </button>
      </div>

      {photos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-card)] p-3 space-y-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[var(--bg-input)]">
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                {photo.isCover && (
                  <span className="absolute top-2 left-2 rounded bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-white">
                    Обложка
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-[var(--text-muted)]">Тип фото</label>
                <select
                  value={photo.type}
                  onChange={(e) => onSetType(photo.id, e.target.value as PhotoType)}
                  className="w-full rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px] text-[var(--text-primary)]"
                >
                  {TYPES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSetCover(photo.id)}
                  className="rounded-[10px] border border-[var(--border-main)] px-3 py-2 text-[12px] font-medium text-[var(--text-primary)]"
                >
                  Сделать обложкой
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(photo.id)}
                  className="rounded-[10px] border border-red-400/70 px-3 py-2 text-[12px] font-medium text-red-400"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
