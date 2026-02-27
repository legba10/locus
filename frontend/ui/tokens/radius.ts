/**
 * TZ-73: Радиусы. Единая система, без случайных значений.
 */

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  round: 999,
} as const

export type Radius = typeof radius
