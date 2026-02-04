'use client'

import { CITIES } from '@/shared/data/cities'
import { cn } from '@/shared/utils/cn'

interface CityInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  listId?: string
}

export function CityInput({
  value,
  onChange,
  placeholder = 'Выберите город',
  className,
  listId = 'cities-list',
}: CityInputProps) {
  return (
    <>
      <input
        type="text"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(className)}
      />
      <datalist id={listId}>
        {CITIES.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </>
  )
}
