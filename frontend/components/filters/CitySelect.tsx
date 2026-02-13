'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { CITIES } from '@/shared/data/cities'
import { cn } from '@/shared/utils/cn'

export interface CitySelectProps {
  value: string
  onChange: (city: string) => void
  placeholder?: string
  className?: string
  /** Mobile: открывать fullscreen модалку */
  fullscreenOnMobile?: boolean
}

const LIST_CLASS = 'city-select-item w-full text-left px-4 py-3 text-[14px] transition-colors border-b border-[var(--border)] last:border-0 bg-transparent hover:bg-[var(--accent-soft)]'

export function CitySelect({
  value,
  onChange,
  placeholder = 'Выберите город',
  className,
  fullscreenOnMobile = false,
}: CitySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const fn = () => setIsMobile(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CITIES.slice(0, 80)
    return CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 80)
  }, [query])

  // Sync query with external value when closed to avoid stale/duplicate display (TZ-8)
  useEffect(() => {
    if (!open) setQuery((prev) => (prev !== value ? value : prev))
  }, [value, open])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!fullscreenOnMobile || !isMobile) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open, fullscreenOnMobile, isMobile])

  const handleSelect = (city: string) => {
    onChange(city)
    setQuery(city)
    setOpen(false)
  }

  const openDropdown = () => {
    setQuery(value || query)
    setOpen(true)
  }

  const inputClasses = cn(
    'search-hero-input search-tz7-input w-full text-[15px]',
    'transition-colors',
    className
  )

  /** TZ-8: render list with unique key prefix per context to avoid React reusing nodes (dropdown vs fullscreen) and duplicate symbols */
  const renderCityList = (listKeyPrefix: string) =>
    filtered.length === 0 ? (
      <div key={`${listKeyPrefix}-empty`} className="px-4 py-6 text-[14px] text-[var(--text-secondary)]">Город не найден</div>
    ) : (
      <ul key={`${listKeyPrefix}-list`} className="py-1" role="listbox" aria-label="Список городов" data-testid="city-list">
        {filtered.map((city, index) => (
          <li key={`${listKeyPrefix}-city-${index}-${city}`} role="option" aria-selected={value === city}>
            <button
              type="button"
              className={cn(LIST_CLASS, value === city && 'bg-[var(--accent-soft)] font-medium')}
              onClick={() => handleSelect(city)}
            >
              {city}
            </button>
          </li>
        ))}
      </ul>
    )

  const useFullscreen = fullscreenOnMobile && isMobile && open

  return (
    <>
      <div className="relative" ref={containerRef} data-testid="city-select">
        {value && !open ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-medium bg-[var(--accent-soft)] text-[var(--accent)]')}>
              {value}
              <button type="button" onClick={() => { onChange(''); setQuery(''); }} className="rounded-full p-0.5 hover:bg-[var(--accent)]/20 transition-colors" aria-label="Сбросить город">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
            <button type="button" onClick={openDropdown} className="text-[14px] font-medium text-[var(--accent)] hover:underline">
              Изменить
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={openDropdown}
              placeholder={placeholder}
              className={inputClasses}
              autoComplete="off"
              aria-expanded={open}
              aria-haspopup="listbox"
            />
            {open && !useFullscreen && (
              <div key="city-dropdown" className="city-select-dropdown-tz7 absolute left-0 right-0 top-full z-20 mt-1 rounded-[12px] border border-[var(--border)] shadow-[var(--shadow-1)] max-h-[280px] overflow-y-auto py-1">
                {renderCityList('dropdown')}
              </div>
            )}
          </>
        )}
      </div>
      {useFullscreen && (
        <div key="city-fullscreen" className="fixed inset-0 z-[var(--z-modal)] flex flex-col city-select-fullscreen-tz7 rounded-t-[20px] overflow-hidden" role="dialog" aria-modal="true" aria-label="Выбор города">
          <div className="flex items-center gap-2 p-4 border-b border-[var(--border)] bg-inherit">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className={cn(inputClasses, 'flex-1')}
              autoComplete="off"
              autoFocus
            />
            <button type="button" onClick={() => setOpen(false)} className="rounded-[14px] px-4 py-3 text-[14px] font-semibold text-[var(--accent)]">
              Готово
            </button>
          </div>
          <div className="flex-1 overflow-y-auto city-select-dropdown-tz7">
            {renderCityList('fullscreen')}
          </div>
        </div>
      )}
    </>
  )
}
