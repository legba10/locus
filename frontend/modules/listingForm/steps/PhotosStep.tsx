'use client'

/** TZ-59: загрузка фото — сетка 3–5 колонок, обложка badge, тип через bottom sheet, reorder. */

import { useRef, useState } from 'react'
import type { ListingPhotoDraft, PhotoType } from '../listingStore'
import { PHOTO_TYPE_LABELS } from '../photoController'
import { BottomSheet } from '@/components/ui'

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
  const [sheetPhotoId, setSheetPhotoId] = useState<string | null>(null)

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

  const openSheet = (photoId: string) => setSheetPhotoId(photoId)
  const closeSheet = () => setSheetPhotoId(null)

  const sheetPhoto = sheetPhotoId ? photos.find((p) => p.id === sheetPhotoId) : null

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-[var(--text-muted)]">
        {photos.length} / {MAX_PHOTOS} фото. Клик по фото — тип помещения. Перетащите для изменения порядка; первое фото — обложка.
      </p>

      <div className="photo-grid">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            onClick={() => openSheet(photo.id)}
            className={`photo-item cursor-grab active:cursor-grabbing ${draggedIdx === idx ? 'opacity-50' : ''}`}
          >
            <img src={photo.url} alt="" />
            {photo.isCover && <span className="cover-badge">Обложка</span>}
            <span className="photo-tag">{PHOTO_TYPE_LABELS[photo.type]}</span>
            <button
              type="button"
              className="photo-delete"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(photo.id)
              }}
              aria-label="Удалить фото"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            className="add-photo"
            onClick={() => inputRef.current?.click()}
            disabled={photos.length >= MAX_PHOTOS}
            aria-label="Добавить фото"
          >
            <span className="text-[28px] text-[var(--text-muted)] leading-none">+</span>
          </button>
        )}
      </div>

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

      <BottomSheet open={!!sheetPhoto} onClose={closeSheet} maxHeight="70vh" animateClose className="overflow-y-auto">
        {sheetPhoto && (
          <div className="photo-type-sheet">
            <h3 className="photo-type-sheet__title">Выберите тип помещения</h3>
            <div className="photo-type-sheet__options">
              {TYPES.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="photo-type-sheet__option"
                  onClick={() => {
                    onSetType(sheetPhoto.id, value)
                    closeSheet()
                  }}
                >
                  {label}
                  {sheetPhoto.type === value && <span className="text-[var(--accent)]">✓</span>}
                </button>
              ))}
            </div>
            <div className="photo-type-sheet__actions">
              {!sheetPhoto.isCover && (
                <button
                  type="button"
                  className="photo-type-sheet__btn photo-type-sheet__btn--cover"
                  onClick={() => {
                    onSetCover(sheetPhoto.id)
                    closeSheet()
                  }}
                >
                  Сделать обложкой
                </button>
              )}
              <button
                type="button"
                className="photo-type-sheet__btn photo-type-sheet__btn--delete"
                onClick={() => {
                  onRemove(sheetPhoto.id)
                  closeSheet()
                }}
              >
                Удалить фото
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
