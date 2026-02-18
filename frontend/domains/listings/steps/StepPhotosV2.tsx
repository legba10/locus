'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/shared/utils/cn'

const MIN_PHOTOS = 5
const MAX_PHOTOS = 30

export type PhotoItemV2 = { id: string; file?: File; previewUrl: string; isNew: boolean }

export interface StepPhotosV2Props {
  items: PhotoItemV2[]
  coverIndex: number
  onAddFiles: (files: File[]) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
  onSetCover: (index: number) => void
  /** Показывать ошибку только один раз, без дублей */
  error?: string | null
}

export function StepPhotosV2({
  items,
  coverIndex,
  onAddFiles,
  onRemove,
  onReorder,
  onSetCover,
  error,
}: StepPhotosV2Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragFrom = useRef<number | null>(null)

  const canAdd = items.length < MAX_PHOTOS

  const handleDropZone = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith('image/'))
      if (files.length) onAddFiles(files.slice(0, MAX_PHOTOS - items.length))
    },
    [onAddFiles, items.length]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[var(--text-secondary)]">
          Фото: минимум {MIN_PHOTOS}, максимум {MAX_PHOTOS}
        </span>
        <span className="text-[13px] text-[var(--text-muted)] tabular-nums">{items.length} / {MAX_PHOTOS}</span>
      </div>

      {error && (
        <p className="text-[14px] text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}

      <div
        onDrop={handleDropZone}
        onDragOver={handleDragOver}
        className={cn(
          'rounded-[16px] border-2 border-dashed p-6 min-h-[200px]',
          'border-[var(--border-main)] bg-[var(--bg-input)]/50',
          'flex flex-col items-center justify-center gap-3'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) onAddFiles(files.slice(0, MAX_PHOTOS - items.length))
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!canAdd}
          className={cn(
            'rounded-[12px] px-5 py-3 font-semibold text-[15px] transition-colors',
            canAdd ? 'bg-[var(--accent)] text-[var(--button-primary-text)] hover:opacity-95' : 'bg-[var(--bg-card)] text-[var(--text-muted)] cursor-not-allowed'
          )}
        >
          Загрузить
        </button>
        <p className="text-[13px] text-[var(--text-muted)]">или перетащите сюда</p>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => { dragFrom.current = index }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const from = dragFrom.current
                dragFrom.current = null
                if (from != null && from !== index) onReorder(from, index)
              }}
              className="relative aspect-[4/3] rounded-[12px] overflow-hidden bg-[var(--bg-input)] group"
            >
              <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
              {coverIndex === index && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[var(--accent)] text-white text-[11px] font-semibold">
                  Обложка
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <button
                  type="button"
                  onClick={() => onSetCover(index)}
                  className="px-2 py-1 rounded bg-white/90 text-[12px] font-medium text-[var(--text-primary)]"
                >
                  Обложка
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="px-2 py-1 rounded bg-red-500/90 text-white text-[12px] font-medium"
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
