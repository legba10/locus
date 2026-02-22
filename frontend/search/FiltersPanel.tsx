'use client'

import { BottomSheet } from '@/components/ui/BottomSheet'
import { CityInput } from '@/shared/components/CityInput'
import { useSearchStore } from './store'

interface FiltersPanelProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  previewCount: number
  onQuickApply: () => void
}

function PanelContent({ onApply, onQuickApply, previewCount }: { onApply: () => void; onQuickApply: () => void; previewCount: number }) {
  const s = useSearchStore()
  const { filters } = s

  return (
    <div className="filters-panel flex h-full flex-col">
      <div className="filters-panel flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' as any }}>
        <div>
          <p className="mb-2 block text-[12px] text-[var(--text-muted)]">Быстрые фильтры</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { s.applyQuickFilter('today'); onQuickApply() }} className="h-8 rounded-full border border-[var(--border-main)] px-3 text-[12px]">Сегодня</button>
            <button type="button" onClick={() => { s.applyQuickFilter('budget50'); onQuickApply() }} className="h-8 rounded-full border border-[var(--border-main)] px-3 text-[12px]">До 50к</button>
            <button type="button" onClick={() => { s.applyQuickFilter('pets'); onQuickApply() }} className="h-8 rounded-full border border-[var(--border-main)] px-3 text-[12px]">С животными</button>
            <button type="button" onClick={() => { s.applyQuickFilter('month'); onQuickApply() }} className="h-8 rounded-full border border-[var(--border-main)] px-3 text-[12px]">На месяц</button>
            <button type="button" onClick={() => { s.applyQuickFilter('studio'); onQuickApply() }} className="h-8 rounded-full border border-[var(--border-main)] px-3 text-[12px]">Студия</button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Город</label>
          <CityInput
            value={filters.city ?? ''}
            onChange={(v) => s.setFilter('city', v || null)}
            className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-4 py-3 text-[14px] text-[var(--text-primary)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Цена от</label>
            <input type="number" value={filters.priceFrom ?? ''} onChange={(e) => s.setFilter('priceFrom', e.target.value ? Number(e.target.value) : null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Цена до</label>
            <input type="number" value={filters.priceTo ?? ''} onChange={(e) => s.setFilter('priceTo', e.target.value ? Number(e.target.value) : null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Комнаты</label>
            <select value={filters.rooms ?? ''} onChange={(e) => s.setFilter('rooms', e.target.value ? Number(e.target.value) : null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]">
              <option value="">Любое</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Тип жилья</label>
            <select value={filters.type ?? ''} onChange={(e) => s.setFilter('type', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]">
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
            <select value={filters.rentType ?? ''} onChange={(e) => s.setFilter('rentType', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]">
              <option value="">Любой</option>
              <option value="daily">Посуточно</option>
              <option value="long">Долгосрочно</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Район</label>
            <input value={filters.district ?? ''} onChange={(e) => s.setFilter('district', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" placeholder="Район" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Метро</label>
            <input value={filters.metro ?? ''} onChange={(e) => s.setFilter('metro', e.target.value || null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" placeholder="Станция метро" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-[14px] mt-6">
              <input type="checkbox" checked={Boolean(filters.pets)} onChange={(e) => s.setFilter('pets', e.target.checked)} />
              С животными
            </label>
            <label className="flex items-center gap-2 text-[14px] mt-6">
              <input type="checkbox" checked={filters.furniture} onChange={(e) => s.setFilter('furniture', e.target.checked)} />
              Мебель
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Гости</label>
          <input type="number" value={filters.guests ?? ''} onChange={(e) => s.setFilter('guests', e.target.value ? Number(e.target.value) : null)} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" placeholder="2" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Дата заезда</label>
            <input type="date" value={filters.dates?.checkIn ?? ''} onChange={(e) => s.setFilter('dates', { checkIn: e.target.value, checkOut: filters.dates?.checkOut ?? '' })} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Дата выезда</label>
            <input type="date" value={filters.dates?.checkOut ?? ''} onChange={(e) => s.setFilter('dates', { checkIn: filters.dates?.checkIn ?? '', checkOut: e.target.value })} className="w-full rounded-[12px] border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-2 text-[14px]" />
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 border-t border-[var(--border-main)] bg-[var(--bg-card)] p-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => { s.reset(); onQuickApply() }} className="rounded-[14px] border border-[var(--border-main)] px-4 py-3 text-[14px] font-medium text-[var(--text-primary)]">
            Сбросить
          </button>
          <button type="button" onClick={onApply} className="rounded-[14px] bg-[var(--accent)] px-4 py-3 text-[15px] font-semibold text-[var(--text-on-accent)]">
            Показать {previewCount}
          </button>
        </div>
      </div>
    </div>
  )
}

export function FiltersPanel({ open, onClose, onApply, previewCount, onQuickApply }: FiltersPanelProps) {
  return (
    <>
      <div className="hidden lg:block w-[320px] shrink-0 rounded-[16px] border border-[var(--border-main)] bg-[var(--bg-card)]">
        <PanelContent onApply={onApply} previewCount={previewCount} onQuickApply={onQuickApply} />
      </div>
      <BottomSheet open={open} onClose={onClose} maxHeight="88vh" className="lg:hidden rounded-t-2xl border-0">
        <div className="px-4 py-3 border-b border-[var(--border-main)] flex items-center justify-between">
          <h3 className="text-[16px] font-semibold">Фильтры</h3>
          <span className="text-[13px] text-[var(--text-secondary)]">{previewCount} объявлений</span>
        </div>
        <PanelContent onApply={onApply} previewCount={previewCount} onQuickApply={onQuickApply} />
      </BottomSheet>
    </>
  )
}
