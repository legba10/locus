'use client'

import { cn } from '@/shared/utils/cn'
import type { RentMode } from './StepType'
import type { PhotoItemV2 } from './StepPhotosV2'

export interface StepPreviewProps {
  typeLabel: string
  rentMode: RentMode
  addressDisplay: string
  photos: PhotoItemV2[]
  coverIndex: number
  title: string
  description: string
  price: string
  deposit: string
  rooms: string
  area: string
}

export function StepPreview({
  typeLabel,
  rentMode,
  addressDisplay,
  photos,
  coverIndex,
  title,
  description,
  price,
  deposit,
  rooms,
  area,
}: StepPreviewProps) {
  const coverUrl = photos[coverIndex]?.previewUrl ?? photos[0]?.previewUrl

  return (
    <div className="space-y-6">
      <p className="text-[14px] font-medium text-[var(--text-secondary)]">Предпросмотр карточки</p>
      <div className={cn('rounded-[16px] overflow-hidden border border-[var(--border-main)] bg-[var(--bg-card)]')}>
        <div className="aspect-[16/10] bg-[var(--bg-input)] relative">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-[14px]">
              Нет фото
            </div>
          )}
          <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 text-white text-[12px] font-semibold">
            {rentMode === 'night' ? 'Посуточно' : 'Длительно'}
          </div>
          {price && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-bold text-[18px]">
              {Number(price).toLocaleString('ru-RU')} ₽ {rentMode === 'night' ? '/ сутки' : '/ мес'}
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-[17px] font-bold text-[var(--text-primary)] line-clamp-1">
            {title || 'Без заголовка'}
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)]">{addressDisplay || '—'}</p>
          <div className="flex gap-3 text-[13px] text-[var(--text-muted)]">
            {rooms && <span>{rooms} комн.</span>}
            {area && <span>{area} м²</span>}
          </div>
          {description && (
            <p className="text-[14px] text-[var(--text-secondary)] line-clamp-3">{description}</p>
          )}
          {deposit && Number(deposit) > 0 && (
            <p className="text-[13px] text-[var(--text-muted)]">Залог: {Number(deposit).toLocaleString('ru-RU')} ₽</p>
          )}
        </div>
      </div>
    </div>
  )
}
