/**
 * ТЗ-8: Единая шкала z-index.
 * header: 100, menu: 200, modal: 300, toast: 400.
 * Синхронизировано с styles/zindex.css.
 */
export const zIndex = {
  base: 1,
  header: 100,
  overlay: 150,
  menu: 200,
  notificationPanel: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
} as const

export type ZIndexLayer = keyof typeof zIndex
