/**
 * TZ-33: Единая система отступов. Только эти значения.
 * Запрещено: margin: 13px, padding: 27px, любые случайные значения.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  block: 48,
} as const

export type SpacingKey = keyof typeof spacing

/** Значение в px для стилей */
export function spacingPx(key: SpacingKey): string {
  return `${spacing[key]}px`
}
