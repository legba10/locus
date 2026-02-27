/**
 * TZ-73: Spacing. Запрещено: 13px, 19px, 27px и т.п.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export type Spacing = typeof spacing
