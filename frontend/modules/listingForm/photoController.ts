import type { ListingPhotoDraft, PhotoType } from './listingStore'

/** TZ-48: до 10 фото */
const MAX_PHOTOS = 10

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

/** TZ-59: подписи для выбора типа помещения (bottom sheet) */
export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  bedroom: 'Спальня',
  kitchen: 'Кухня',
  living_room: 'Гостиная',
  bathroom: 'Санузел',
  facade: 'Балкон',
  other: 'Другое',
}

export function addFilesToPhotos(prev: ListingPhotoDraft[], files: File[]): ListingPhotoDraft[] {
  const free = Math.max(0, MAX_PHOTOS - prev.length)
  const nextFiles = files.slice(0, free)
  const startOrder = prev.length
  const mapped = nextFiles.map((file, idx) => ({
    id: uid(),
    file,
    url: URL.createObjectURL(file),
    isNew: true,
    type: 'other' as PhotoType,
    isCover: false,
    order: startOrder + idx,
  }))
  const combined = [...prev, ...mapped]
  if (!combined.some((p) => p.isCover) && combined[0]) combined[0].isCover = true
  return combined.map((p, idx) => ({ ...p, order: idx }))
}

export function setPhotoCover(prev: ListingPhotoDraft[], id: string): ListingPhotoDraft[] {
  return prev.map((p, idx) => ({ ...p, isCover: p.id === id, order: idx }))
}

export function removePhoto(prev: ListingPhotoDraft[], id: string): ListingPhotoDraft[] {
  const next = prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, order: idx }))
  if (!next.some((p) => p.isCover) && next[0]) next[0].isCover = true
  return next
}

export function setPhotoType(prev: ListingPhotoDraft[], id: string, type: PhotoType): ListingPhotoDraft[] {
  return prev.map((p) => (p.id === id ? { ...p, type } : p))
}

export function reorderPhotos(prev: ListingPhotoDraft[], from: number, to: number): ListingPhotoDraft[] {
  const arr = [...prev]
  const item = arr[from]
  if (!item) return prev
  arr.splice(from, 1)
  arr.splice(to, 0, item)
  return arr.map((p, idx) => ({ ...p, order: idx }))
}

export function buildPhotoMetaForHouseRules(photos: ListingPhotoDraft[]) {
  return photos.map((p, idx) => ({
    order: idx,
    type: p.type,
    isCover: p.isCover,
  }))
}
