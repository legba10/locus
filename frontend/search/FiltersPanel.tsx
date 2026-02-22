'use client'

import { BottomSheet } from '@/components/ui/BottomSheet'
import { CityInput } from '@/shared/components/CityInput'
import { useSearchStore } from './searchStore'

interface FiltersPanelProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  previewCount: number
}

function PanelContent({ onApply }: { onApply: () => void }) {
  const s = useSearchStore()

  return (
    <div className="filters-panel flex h-full flex-col">
      <div className="filters-panel flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' as any }}>
        <div>
          <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Город</label>
          <CityInput
            value={s.city ?? ''}
            onChange={(v) => s.setField('city', v || null)}
            className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-4 py-3 text-[14px] text-[var(--text-primary)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Цена от</label>
            <input type="number" value={s.priceMin ?? ''} onChange={(e) => s.setField('priceMin', e.target.value ? Number(e.target.value) : null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Цена до</label>
            <input type="number" value={s.priceMax ?? ''} onChange={(e) => s.setField('priceMax', e.target.value ? Number(e.target.value) : null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Комнаты</label>
            <select value={s.rooms ?? ''} onChange={(e) => s.setField('rooms', e.target.value ? Number(e.target.value) : null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]">
              <option value="">Любое</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Тип жилья</label>
            <select value={s.type ?? ''} onChange={(e) => s.setField('type', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]">
              <option value="">Любой</option>
              <option value="apartment">Квартира</option>
              <option value="house">Дом</option>
              <option value="studio">Студия</option>
              <option value="room">Комната</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Срок аренды</label>
            <select value={s.duration ?? ''} onChange={(e) => s.setField('duration', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]">
              <option value="">Любой</option>
              <option value="daily">Посуточно</option>
              <option value="long">Долгосрочно</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Район</label>
            <input value={s.district ?? ''} onChange={(e) => s.setField('district', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" placeholder="Район" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Метро</label>
            <input value={s.metro ?? ''} onChange={(e) => s.setField('metro', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" placeholder="Станция метро" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-[14px] mt-6">
              <input type="checkbox" checked={s.pets} onChange={(e) => s.setField('pets', e.target.checked)} />
              С животными
            </label>
            <label className="flex items-center gap-2 text-[14px] mt-6">
              <input type="checkbox" checked={s.furniture} onChange={(e) => s.setField('furniture', e.target.checked)} />
              Мебель
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Дата заезда</label>
            <input type="date" value={s.dates?.checkIn ?? ''} onChange={(e) => s.setField('dates', { checkIn: e.target.value, checkOut: s.dates?.checkOut ?? '' })} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Дата выезда</label>
            <input type="date" value={s.dates?.checkOut ?? ''} onChange={(e) => s.setField('dates', { checkIn: s.dates?.checkIn ?? '', checkOut: e.target.value })} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border-main)] p-4">
        <button type="button" onClick={onApply} className="w-full rounded-[14px] bg-[var(--accent)] px-4 py-3 text-[15px] font-semibold text-[var(--text-on-accent)]">
          Применить
        </button>
      </div>
    </div>
  )
}

export function FiltersPanel({ open, onClose, onApply, previewCount }: FiltersPanelProps) {
  return (
    <>
      <div className="hidden lg:block w-[320px] shrink-0 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]">
        <PanelContent onApply={onApply} />
      </div>
      <BottomSheet open={open} onClose={onClose} maxHeight="88vh" className="lg:hidden rounded-t-2xl border-0">
        <div className="px-4 py-3 border-b border-[var(--border-main)] flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">Фильтры</h3>
          <span className="text-[13px] text-[var(--text-secondary)]">{previewCount} объявлений</span>
        </div>
        <PanelContent onApply={onApply} />
      </BottomSheet>
    </>
  )
}
