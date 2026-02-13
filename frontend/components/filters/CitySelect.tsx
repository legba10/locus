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

const LIST_CLASS = 'w-full text-left px-4 py-3 text-[14px] text-[var(--text-main)] hover:bg-[var(--accent-soft)] transition-colors border-b border-[var(--border)] last:border-0'

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
    'w-full rounded-[14px] px-4 py-3 text-[14px]',
    'bg-[var(--bg-card)] border border-[var(--border)]',
    'text-[var(--text-main)] placeholder-[var(--text-secondary)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]',
    'transition-colors',
    className
  )

  const listContent = (
    <>
      {filtered.length === 0 ? (
        <div className="px-4 py-6 text-[14px] text-[var(--text-secondary)]">Город не найден</div>
      ) : (
        <ul className="py-1">
          {filtered.map((city) => (
            <li key={city}>
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
      )}
    </>
  )

  const useFullscreen = fullscreenOnMobile && isMobile && open

  return (
    <>
      <div className="relative" ref={containerRef}>
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
            />
            {open && !useFullscreen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-modal)] max-h-[280px] overflow-y-auto">
                {listContent}
              </div>
            )}
          </>
        )}
      </div>
      {useFullscreen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col bg-[var(--bg-card)]" role="dialog" aria-modal="true" aria-label="Выбор города">
          <div className="flex items-center gap-2 p-4 border-b border-[var(--border)]">
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
          <div className="flex-1 overflow-y-auto">
            {listContent}
          </div>
        </div>
      )}
    </>
  )
}
