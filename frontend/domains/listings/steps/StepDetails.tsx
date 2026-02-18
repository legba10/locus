'use client'

import { cn } from '@/shared/utils/cn'

const inputCls = cn(
  'w-full rounded-[12px] px-4 py-3 border border-[var(--border-main)] bg-[var(--bg-input)]',
  'text-[var(--text-primary)] text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20'
)

export interface StepDetailsProps {
  rooms: string
  area: string
  floor: string
  totalFloors: string
  repair: string
  furniture: string
  appliances: string
  onRoomsChange: (v: string) => void
  onAreaChange: (v: string) => void
  onFloorChange: (v: string) => void
  onTotalFloorsChange: (v: string) => void
  onRepairChange: (v: string) => void
  onFurnitureChange: (v: string) => void
  onAppliancesChange: (v: string) => void
}

export function StepDetails({
  rooms,
  area,
  floor,
  totalFloors,
  repair,
  furniture,
  appliances,
  onRoomsChange,
  onAreaChange,
  onFloorChange,
  onTotalFloorsChange,
  onRepairChange,
  onFurnitureChange,
  onAppliancesChange,
}: StepDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Комнаты</label>
        <input value={rooms} onChange={(e) => onRoomsChange(e.target.value)} className={inputCls} type="number" min={1} placeholder="2" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Площадь, м²</label>
        <input value={area} onChange={(e) => onAreaChange(e.target.value)} className={inputCls} type="number" min={1} placeholder="45" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Этаж</label>
        <input value={floor} onChange={(e) => onFloorChange(e.target.value)} className={inputCls} type="number" min={0} placeholder="5" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Этажность</label>
        <input value={totalFloors} onChange={(e) => onTotalFloorsChange(e.target.value)} className={inputCls} type="number" min={1} placeholder="9" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Ремонт</label>
        <input value={repair} onChange={(e) => onRepairChange(e.target.value)} className={inputCls} placeholder="Евроремонт" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Мебель</label>
        <input value={furniture} onChange={(e) => onFurnitureChange(e.target.value)} className={inputCls} placeholder="Полная" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">Техника</label>
        <input value={appliances} onChange={(e) => onAppliancesChange(e.target.value)} className={inputCls} placeholder="Холодильник, стиральная" />
      </div>
    </div>
  )
}
