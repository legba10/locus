/**
 * TZ-4: Единая шкала z-index.
 * header: 100, dropdown: 200, overlay: 900, modal: 1000, toast: 1100.
 * Синхронизировано с styles/zindex.css.
 */
export const zIndex = {
  base: 1,
  header: 100,
  dropdown: 200,
  menu: 200,
  notificationPanel: 200,
  overlay: 900,
  modal: 1000,
  toast: 1100,
  tooltip: 1200,
} as const

export type ZIndexLayer = keyof typeof zIndex
