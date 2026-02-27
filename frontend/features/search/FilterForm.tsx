'use client'

import type { Filters } from './search.types'
import styles from './search.module.css'

interface FilterFormProps {
  filters: Filters
  onFiltersChange: (patch: Partial<Filters>) => void
  renderApply?: () => React.ReactNode
}

export default function FilterForm({ filters, onFiltersChange, renderApply }: FilterFormProps) {
  return (
    <>
      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor="filter-form-city">
          Город
        </label>
        <input
          id="filter-form-city"
          type="text"
          className={styles.filterInput}
          placeholder="Москва"
          value={filters.city ?? ''}
          onChange={(e) => onFiltersChange({ city: e.target.value.trim() || undefined })}
        />
      </div>

      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor="filter-form-priceMin">
          Цена от (₽)
        </label>
        <input
          id="filter-form-priceMin"
          type="number"
          min={0}
          className={styles.filterInput}
          placeholder="0"
          value={filters.priceMin ?? ''}
          onChange={(e) => onFiltersChange({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor="filter-form-priceMax">
          Цена до (₽)
        </label>
        <input
          id="filter-form-priceMax"
          type="number"
          min={0}
          className={styles.filterInput}
          placeholder="100000"
          value={filters.priceMax ?? ''}
          onChange={(e) => onFiltersChange({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor="filter-form-rooms">
          Комнат
        </label>
        <select
          id="filter-form-rooms"
          className={styles.filterSelect}
          value={filters.rooms ?? ''}
          onChange={(e) => onFiltersChange({ rooms: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Любое</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div className={styles.filterField}>
        <label className={styles.filterLabel} htmlFor="filter-form-rentType">
          Тип аренды
        </label>
        <select
          id="filter-form-rentType"
          className={styles.filterSelect}
          value={filters.rentType ?? ''}
          onChange={(e) => onFiltersChange({ rentType: (e.target.value || undefined) as Filters['rentType'] })}
        >
          <option value="">Любой</option>
          <option value="daily">Посуточно</option>
          <option value="monthly">Долгосрочно</option>
        </select>
      </div>

      {renderApply?.()}
    </>
  )
}
