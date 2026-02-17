/**
 * ТЗ: категоризация фотографий — тип помещения для каждого фото.
 * Обязательно: минимум 5 фото, из них 1 комната (спальня/зал) и 1 санузел.
 */
export type ListingPhotoTag =
  | "room"      // комната (общий, для обратной совместимости)
  | "kitchen"   // кухня
  | "bedroom"   // спальня
  | "living"    // зал
  | "bathroom"  // ванная
  | "toilet"    // санузел
  | "corridor"  // коридор
  | "balcony"   // балкон
  | "facade"    // фасад
  | "other";    // другое

export type ListingPhoto = {
  id: string;
  file: File;
  preview: string;
  tag: ListingPhotoTag;
  order: number;
};

/** Все варианты для модалки: тип помещения + действие «Обложка» */
export const PHOTO_TAG_OPTIONS: Array<
  { value: "cover" | ListingPhotoTag; label: string }
> = [
  { value: "cover", label: "Обложка" },
  { value: "kitchen", label: "Кухня" },
  { value: "bedroom", label: "Спальня" },
  { value: "living", label: "Зал" },
  { value: "room", label: "Комната" },
  { value: "bathroom", label: "Ванная" },
  { value: "toilet", label: "Санузел" },
  { value: "corridor", label: "Коридор" },
  { value: "balcony", label: "Балкон" },
  { value: "facade", label: "Фасад" },
  { value: "other", label: "Другое" },
];

/** Только типы помещений (без cover) для выбора в модалке */
export const ROOM_TYPE_OPTIONS: Array<{ value: ListingPhotoTag; label: string }> = [
  { value: "kitchen", label: "Кухня" },
  { value: "bedroom", label: "Спальня" },
  { value: "living", label: "Зал" },
  { value: "room", label: "Комната" },
  { value: "bathroom", label: "Ванная" },
  { value: "toilet", label: "Санузел" },
  { value: "corridor", label: "Коридор" },
  { value: "balcony", label: "Балкон" },
  { value: "facade", label: "Фасад" },
  { value: "other", label: "Другое" },
];

export const PHOTO_TAG_LABELS: Record<ListingPhotoTag, string> = {
  room: "Комната",
  kitchen: "Кухня",
  bedroom: "Спальня",
  living: "Зал",
  bathroom: "Ванная",
  toilet: "Санузел",
  corridor: "Коридор",
  balcony: "Балкон",
  facade: "Фасад",
  other: "Другое",
};

export const MIN_PHOTOS = 5;
export const MAX_PHOTOS = 12;

/** Теги, считающиеся «комнатой» (обязателен хотя бы один) */
export const ROOM_TAGS: ListingPhotoTag[] = ["room", "bedroom", "living"];
/** Теги, считающиеся санузлом (обязателен хотя бы один) */
export const TOILET_TAGS: ListingPhotoTag[] = ["toilet", "bathroom"];

/**
 * Проверка: есть ли среди тегов комната и санузел.
 */
export function hasRequiredRoomAndToilet(tags: ListingPhotoTag[]): boolean {
  const hasRoom = tags.some((t) => ROOM_TAGS.includes(t));
  const hasToilet = tags.some((t) => TOILET_TAGS.includes(t));
  return hasRoom && hasToilet;
}
