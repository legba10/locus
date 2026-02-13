/**
 * ТЗ-8: Единая шкала z-index. Синхронизировано с zindex.css.
 * header: 100, menu: 200, modal: 300, toast: 400.
 */
export const z = {
  base: 1,
  header: 100,
  bottomBar: 60,
  overlay: 150,
  menu: 200,
  modal: 300,
  notificationPanel: 200,
  notification: 200,
  toast: 400,
  tooltip: 500,
} as const

export type ZLayer = keyof typeof z
