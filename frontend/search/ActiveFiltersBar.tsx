'use client'

import { useSearchStore } from './searchStore'

interface ActiveFilter {
  id: string
  label: string
}

export function ActiveFiltersBar({ onChange }: { onChange: () => void }) {
  const s = useSearchStore()

  const items: ActiveFilter[] = []
  if (s.city) items.push({ id: 'city', label: s.city })
  if (s.priceMin != null || s.priceMax != null) {
    const priceLabel =
      s.priceMin != null && s.priceMax != null
        ? `${s.priceMin} - ${s.priceMax}`
        : s.priceMin != null
          ? `от ${s.priceMin}`
          : `до ${s.priceMax}`
    items.push({ id: 'price', label: `${priceLabel} ₽` })
  }
  if (s.rooms != null) items.push({ id: 'rooms', label: `${s.rooms}${s.rooms >= 4 ? '+' : ''} комнаты` })
  if (s.type) items.push({ id: 'type', label: s.type })
  if (s.pets) items.push({ id: 'pets', label: 'С животными' })
  if (s.furniture) items.push({ id: 'furniture', label: 'С мебелью' })
  if (s.metro) items.push({ id: 'metro', label: `Метро: ${s.metro}` })
  if (s.district) items.push({ id: 'district', label: `Район: ${s.district}` })

  if (!items.length) return null

  const remove = (id: string) => {
    if (id === 'city') s.setField('city', null)
    if (id === 'price') s.setMany({ priceMin: null, priceMax: null })
    if (id === 'rooms') s.setField('rooms', null)
    if (id === 'type') s.setField('type', null)
    if (id === 'pets') s.setField('pets', false)
    if (id === 'furniture') s.setField('furniture', false)
    if (id === 'metro') s.setField('metro', null)
    if (id === 'district') s.setField('district', null)
    onChange()
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {items.map((f) => (
        <span
          key={f.id}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1.5 text-[13px] text-[var(--accent)]"
        >
          {f.label}
          <button type="button" onClick={() => remove(f.id)} className="rounded-full px-1 hover:bg-[var(--accent)]/20" aria-label={`Удалить ${f.label}`}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
