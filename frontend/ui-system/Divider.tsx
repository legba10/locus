'use client'

import { cn } from '@/shared/utils/cn'

interface DividerProps {
  className?: string
  label?: string
}

export function Divider({ className, label }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)}>
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm text-gray-400">{label}</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>
    )
  }
  
  return <div className={cn('border-t border-gray-200 my-4', className)} />
}
