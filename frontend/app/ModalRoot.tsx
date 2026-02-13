'use client'

/**
 * TZ-4: Единый контейнер для всех модалок.
 * В layout рендерится один раз. Все модалки должны рендериться сюда через portal.
 * Контейнер: fixed inset 0, z-overlay, pointer-events none (клики проходят, когда пусто).
 */
export default function ModalRoot() {
  return (
    <div
      id="modal-root"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 'var(--z-overlay)' }}
      aria-hidden
    />
  )
}
