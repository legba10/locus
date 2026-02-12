/**
 * ТЗ-3: Единая система слоёв (z-index).
 * Использовать эти значения вместо произвольных чисел.
 * Синхронизировано с layers.css (CSS-переменные).
 */
export const z = {
  base: 1,
  header: 50,
  dropdown: 200,
  overlay: 500,
  modal: 800,
  notification: 900,
  toast: 1000,
} as const

export type ZLayer = keyof typeof z
