'use client'

/** TZ-48: до 10 фото, drag reorder, preview grid 2x */

import { useRef, useState } from 'react'
import type { ListingPhotoDraft, PhotoType } from '../listingStore'
import { PHOTO_TYPE_LABELS } from '../photoController'
import { reorderPhotos } from '../photoController'

interface PhotosStepProps {
  photos: ListingPhotoDraft[]
  onAddFiles: (files: File[]) => void
  onSetType: (id: string, type: PhotoType) => void
  onSetCover: (id: string) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
}

const TYPES = Object.entries(PHOTO_TYPE_LABELS) as Array<[PhotoType, string]>
const MAX_PHOTOS = 10

export function PhotosStep({ photos, onAddFiles, onSetType, onSetCover, onRemove, onReorder }: PhotosStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  const handleFiles = (files: File[]) => {
    const free = Math.max(0, MAX_PHOTOS - photos.length)
    onAddFiles(files.slice(0, free))
  }

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    const fromIdx = draggedIdx ?? parseInt(e.dataTransfer.getData('text/plain'), 10)
    setDraggedIdx(null)
    if (fromIdx !== toIdx && fromIdx >= 0 && fromIdx < photos.length) {
      onReorder(fromIdx, toIdx)
    }
  }

  const handleDragEnd = () => setDraggedIdx(null)

  return (
    <div className="grid gap-[14px]">
      <div className="rounded-[14px] border border-dashed border-[var(--border-main)] bg-[var(--bg-input)]/60 p-5 text-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) handleFiles(files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={photos.length >= MAX_PHOTOS}
          className="rounded-[12px] px-4 py-2 bg-[var(--accent)] text-[var(--button-primary-text)] text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Добавить фото
        </button>
        <p className="text-[12px] text-[var(--text-muted)] mt-2">
          {photos.length} / {MAX_PHOTOS} фото. Перетащите для изменения порядка.
        </p>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`
                rounded-[12px] card-tz47 p-3 space-y-2 cursor-grab active:cursor-grabbing
                ${draggedIdx === idx ? 'opacity-50 ring-2 ring-[var(--accent)]' : ''}
              `}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[var(--bg-input)]">
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                {photo.isCover && (
                  <span className="absolute top-2 left-2 rounded bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-white">
                    Обложка
                  </span>
                )}
              </div>
              <select
                value={photo.type}
                onChange={(e) => onSetType(photo.id, e.target.value as PhotoType)}
                className="w-full rounded-[10px] border border-[var(--border-main)] bg-[var(--bg-input)] px-2 py-1.5 text-[12px] text-[var(--text-primary)]"
              >
                {TYPES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSetCover(photo.id)}
                  className="flex-1 rounded-[10px] border border-[var(--border-main)] px-2 py-1.5 text-[11px] font-medium text-[var(--text-primary)]"
                >
                  Обложка
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(photo.id)}
                  className="rounded-[10px] border border-red-400/70 px-2 py-1.5 text-[11px] font-medium text-red-400"
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
