/**
 * TZ-73: Высоты кнопок и инпутов. Primary/Secondary 52px, Small 40px, Icon 44px.
 */

export const sizes = {
  button: 52,
  buttonSmall: 40,
  buttonIcon: 44,
  input: 52,
  navHeight: 64,
} as const

export type Sizes = typeof sizes
