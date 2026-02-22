'use client'

import { SelectedChips } from '@/filters/SelectedChips'

export function ActiveFiltersBar({ onChange }: { onChange: () => void }) {
  return <SelectedChips onChange={onChange} />
}
