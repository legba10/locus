/**
 * TZ-73: Единый источник цветов. Запрещено использовать HEX вне этого файла.
 */

export const colors = {
  primary: '#7C5CFF',

  bgDark: '#0F1425',
  bgCardDark: '#12182B',

  bgLight: '#F4F6FB',
  bgCardLight: '#FFFFFF',

  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#AAB0C0',

  textPrimaryLight: '#111111',
  textSecondaryLight: '#6B7280',

  borderLight: 'rgba(0, 0, 0, 0.06)',
  borderDark: 'rgba(255, 255, 255, 0.08)',
} as const

export type Colors = typeof colors
