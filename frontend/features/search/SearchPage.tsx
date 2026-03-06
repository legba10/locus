'use client'

/** TZ-2: страница поиска — строка, фильтры, результаты */

import { useState } from 'react'
import SearchBar from './SearchBar'
import FiltersDrawer from './FiltersDrawer'
import ListingsResult from './ListingsResult'
import type { SearchFilters } from './FiltersState'
import styles from './search.module.css'

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.searchWrapper}>
      <SearchBar
        filters={filters}
        setFilters={setFilters}
        openFilters={() => setOpen(true)}
      />

      <FiltersDrawer
        open={open}
        close={() => setOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      <ListingsResult filters={filters} />
    </div>
  )
}
