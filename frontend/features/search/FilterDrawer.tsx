'use client'

import type { Filters } from './search.types'
import styles from './search.module.css'
import FilterForm from './FilterForm'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  filters: Filters
  onFiltersChange: (patch: Partial<Filters>) => void
  onApply: () => void
}

export default function FilterDrawer({ open, onClose, filters, onFiltersChange, onApply }: FilterDrawerProps) {
  if (!open) return null

  const handleApply = () => {
    onApply()
    onClose()
  }

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} aria-hidden />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Фильтры">
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Фильтры</h2>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <FilterForm
          filters={filters}
          onFiltersChange={onFiltersChange}
          renderApply={() => (
            <button type="button" className={styles.drawerApply} onClick={handleApply}>
              Применить
            </button>
          )}
        />
      </div>
    </>
  )
}
