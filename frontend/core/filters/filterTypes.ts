/**
 * ТЗ-7 + ТЗ-4.1: Унификация типов фильтров.
 * Каноническое состояние: city, priceFrom/To, rooms[], type[], radius, sort.
 * Legacy-поля (budgetMin, budgetMax, type string, rooms string) синхронизируются для старого UI.
 */

export type FilterKey = 'city' | 'budget' | 'type' | 'rooms' | 'duration' | 'aiToggle'

export interface FilterFieldBase {
  label: string
  value: string
  display: string
}

export type SortOption = 'popular' | 'price_asc' | 'price_desc'

/** ТЗ-4.1: каноническое ядро состояния фильтров */
export interface FilterStateCore {
  city: string | null
  priceFrom: number | null
  priceTo: number | null
  rooms: number[]
  type: string[]
  radius: number
  sort: SortOption
}

/** Расширенное состояние: ядро + legacy для совместимости с текущим UI */
export interface FilterState extends FilterStateCore {
  budgetMin: number | ''
  budgetMax: number | ''
  duration: string
  aiMode: boolean
}

export const DEFAULT_FILTER_STATE_CORE: FilterStateCore = {
  city: null,
  priceFrom: null,
  priceTo: null,
  rooms: [],
  type: [],
  radius: 2000,
  sort: 'popular',
}

export const DEFAULT_FILTER_STATE: FilterState = {
  ...DEFAULT_FILTER_STATE_CORE,
  budgetMin: '',
  budgetMax: '',
  duration: '',
  aiMode: false,
}

export type BudgetDisplay = { min: number; max: number; label: string }
