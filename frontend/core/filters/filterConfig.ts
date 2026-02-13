/**
 * ТЗ-7: Конфиг опций фильтров — типы жилья, срок, комнаты.
 */

export const PROPERTY_TYPES = [
  { value: '', label: 'Любой' },
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Дом' },
  { value: 'room', label: 'Комната' },
  { value: 'studio', label: 'Студия' },
] as const

export const DURATION_OPTIONS = [
  { value: '', label: 'Любой' },
  { value: 'short', label: 'Посуточно' },
  { value: 'long', label: 'Долгосрочно' },
] as const

export const ROOMS_OPTIONS = [
  { value: '', label: 'Любое' },
  { value: '1', label: '1 комната' },
  { value: '2', label: '2 комнаты' },
  { value: '3', label: '3 комнаты' },
  { value: '4', label: '4+ комнат' },
] as const

/** Границы и шаги бюджета (руб/мес) */
export const BUDGET_MIN = 0
export const BUDGET_MAX = 500_000
export const BUDGET_STEP = 5000

/** Предустановки бюджета для быстрого выбора */
export const BUDGET_PRESETS: { min: number; max: number; label: string }[] = [
  { min: 0, max: 30_000, label: 'до 30 000 ₽' },
  { min: 30_000, max: 50_000, label: '30 — 50 тыс. ₽' },
  { min: 50_000, max: 80_000, label: '50 — 80 тыс. ₽' },
  { min: 80_000, max: 150_000, label: '80 — 150 тыс. ₽' },
  { min: 150_000, max: 500_000, label: 'от 150 тыс. ₽' },
]
