'use client'

import { CITIES } from '@/shared/data/cities'
import { cn } from '@/shared/utils/cn'
import { useEffect, useMemo, useRef, useState } from 'react'

interface CityInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CityInput({
  value,
  onChange,
  placeholder = 'Выберите город',
  className,
}: CityInputProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return CITIES
    return CITIES.filter((city) => city.toLowerCase().includes(query))
  }, [value])

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={cn(className)}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] shadow-lg">
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[13px] text-[var(--text-muted)]">Город не найден</div>
            ) : (
              filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  className="w-full text-left px-3 py-2 text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                  onClick={() => {
                    onChange(city)
                    setOpen(false)
                  }}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
