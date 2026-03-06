'use client'

/** TZ-2: drawer фильтров с переключателем AI/ручной */

import type { SearchFilters } from './FiltersState'
import styles from './search.module.css'

interface FiltersDrawerProps {
  open: boolean
  close: () => void
  filters: SearchFilters
  setFilters: (f: SearchFilters) => void
}

export default function FiltersDrawer({ open, close, filters, setFilters }: FiltersDrawerProps) {
  if (!open) return null

  return (
    <>
      <div className={styles.drawerOverlay} onClick={close} aria-hidden />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>Фильтры</h2>
          <button type="button" className={styles.drawerClose} onClick={close} aria-label="Закрыть">
            ×
          </button>
        </div>

        <input
          type="text"
          placeholder="Город"
          value={filters.city ?? ''}
          onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
          className={styles.filterInput}
        />

        <select
          value={filters.rooms ?? ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              rooms: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className={styles.filterSelect}
        >
          <option value="">Комнаты</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>

        <input
          type="number"
          placeholder="Цена от (₽)"
          value={filters.priceMin ?? ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              priceMin: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className={styles.filterInput}
        />

        <input
          type="number"
          placeholder="Цена до (₽)"
          value={filters.priceMax ?? ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              priceMax: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className={styles.filterInput}
        />

        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={filters.mode !== 'ai' ? styles.modeSwitchActive : ''}
            onClick={() => setFilters({ ...filters, mode: 'manual' })}
          >
            Ручной поиск
          </button>
          <button
            type="button"
            className={filters.mode === 'ai' ? styles.modeSwitchActive : ''}
            onClick={() => setFilters({ ...filters, mode: 'ai' })}
          >
            AI подбор
          </button>
        </div>

        <button type="button" className={styles.drawerApply} onClick={close}>
          Применить
        </button>
      </div>
    </>
  )
}
