/**
 * TZ-4: Единая шкала z-index. Синхронизировано с zindex.css.
 * header: 100, dropdown: 200, overlay: 900, modal: 1000, toast: 1100.
 */
export const z = {
  base: 1,
  header: 100,
  bottomBar: 60,
  dropdown: 200,
  menu: 200,
  notificationPanel: 200,
  notification: 200,
  overlay: 900,
  modal: 1000,
  toast: 1100,
  tooltip: 1200,
} as const

export type ZLayer = keyof typeof z
