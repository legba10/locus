'use client'

import type { SearchMode } from './search.types'
import styles from './search.module.css'

interface SearchBarProps {
  query: string
  onQueryChange: (value: string) => void
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  onOpenFilters: () => void
}

export default function SearchBar({
  query,
  onQueryChange,
  mode,
  onModeChange,
  onOpenFilters,
}: SearchBarProps) {
  return (
    <div className={styles.searchBar}>
      <input
        type="search"
        className={styles.searchBarInput}
        placeholder="Город, улица или ЖК"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        aria-label="Поиск"
      />
      <button
        type="button"
        className={styles.searchBarButton}
        onClick={onOpenFilters}
      >
        Фильтры
      </button>
      <button
        type="button"
        className={`${styles.searchBarButtonAi} ${mode === 'ai' ? styles.searchBarButtonAiActive : ''}`}
        onClick={() => onModeChange(mode === 'ai' ? 'normal' : 'ai')}
      >
        AI
      </button>
    </div>
  )
}
