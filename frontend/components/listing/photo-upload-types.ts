/**
 * ТЗ №4: модель фото при размещении объявления.
 * tag — для подписи и валидации (комната + санузел обязательны).
 * order — для сортировки; первое фото = обложка.
 */
export type ListingPhotoTag = "room" | "kitchen" | "bathroom" | "balcony" | "other";

export type ListingPhoto = {
  id: string;
  file: File;
  preview: string;
  tag: ListingPhotoTag;
  order: number;
};

/** Варианты в селекторе: обложка (действие) + теги */
export const PHOTO_TAG_OPTIONS: Array<
  { value: "cover" | ListingPhotoTag; label: string } 
> = [
  { value: "cover", label: "Обложка" },
  { value: "room", label: "Комната" },
  { value: "kitchen", label: "Кухня" },
  { value: "bathroom", label: "Санузел" },
  { value: "balcony", label: "Балкон" },
  { value: "other", label: "Другое" },
];

export const PHOTO_TAG_LABELS: Record<ListingPhotoTag, string> = {
  room: "Комната",
  kitchen: "Кухня",
  bathroom: "Санузел",
  balcony: "Балкон",
  other: "Другое",
};

export const MIN_PHOTOS = 5;
export const MAX_PHOTOS = 12;
export const REQUIRED_TAGS: ListingPhotoTag[] = ["room", "bathroom"];
