'use client'

/** TZ-2: строка поиска */

import type { SearchFilters } from './FiltersState'
import styles from './search.module.css'

interface SearchBarProps {
  filters: SearchFilters
  setFilters: (f: SearchFilters) => void
  openFilters: () => void
}

export default function SearchBar({ filters, setFilters, openFilters }: SearchBarProps) {
  return (
    <div className={styles.searchBar}>
      <input
        type="search"
        placeholder="Город, улица или ЖК"
        value={filters.query ?? ''}
        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        className={styles.searchBarInput}
        aria-label="Поиск"
      />
      <button type="button" className={styles.searchBarButton} onClick={openFilters}>
        Фильтры
      </button>
      <button
        type="button"
        className={`${styles.searchBarButtonAi} ${filters.mode === 'ai' ? styles.searchBarButtonAiActive : ''}`}
        onClick={() => setFilters({ ...filters, mode: filters.mode === 'ai' ? 'manual' : 'ai' })}
      >
        AI
      </button>
    </div>
  )
}
