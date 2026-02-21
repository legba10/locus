/** TZ-33: единый источник spacing-токенов для UI. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  block: 48,
} as const

export type SpacingToken = keyof typeof spacing
