'use client'

import { forwardRef, useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

/** ТЗ-4: Switch. Только токены (accent, bg-secondary, border). */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id, checked, defaultChecked, ...props }, ref) => {
    const uid = id ?? `switch-${Math.random().toString(36).slice(2)}`
    const [on, setOn] = useState(Boolean(defaultChecked ?? checked))
    useEffect(() => {
      if (checked !== undefined) setOn(checked)
    }, [checked])
    return (
      <label
        htmlFor={uid}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer text-body text-[var(--text-primary)]',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'relative inline-block w-11 h-6 rounded-full overflow-hidden border border-[var(--border)] transition-colors',
            (checked ?? on) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-secondary)]'
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={uid}
            role="switch"
            checked={checked ?? on}
            onChange={(e) => {
              if (checked === undefined) setOn(e.target.checked)
              props.onChange?.(e)
            }}
            className="sr-only"
            {...props}
          />
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[var(--surface)] shadow-[var(--shadow-card)] transition-transform',
              (checked ?? on) && 'translate-x-5'
            )}
          />
        </span>
        {label && <span>{label}</span>}
      </label>
    )
  }
)
Switch.displayName = 'Switch'
