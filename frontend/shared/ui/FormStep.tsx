import { cn } from '@/shared/utils/cn'

export type FormStepProps = {
  title: string
  description?: string
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function FormStep({ title, description, right, children, className }: FormStepProps) {
  return (
    <section className={cn('rounded-2xl border border-border bg-surface-2', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-text-mut">{description}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

