/**
 * ТЗ-7: Унификация типов фильтров.
 * Каждый фильтр: label, value, display.
 */

export type FilterKey = 'city' | 'budget' | 'type' | 'rooms' | 'duration' | 'aiToggle'

export interface FilterFieldBase {
  label: string
  value: string
  display: string
}

export interface FilterState {
  city: string
  budgetMin: number | ''
  budgetMax: number | ''
  type: string
  rooms: string
  duration: string
  aiMode: boolean
}

export const DEFAULT_FILTER_STATE: FilterState = {
  city: '',
  budgetMin: '',
  budgetMax: '',
  type: '',
  rooms: '',
  duration: '',
  aiMode: true,
}

export type BudgetDisplay = { min: number; max: number; label: string }
