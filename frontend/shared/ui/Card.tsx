import { cn } from '@/shared/utils/cn'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-surface-2 shadow-card', className)}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { className?: string }) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { className?: string }) {
  return <p className={cn('mt-1 text-sm text-text-mut', className)} {...props} />
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return <div className={cn('px-5 pb-5', className)} {...props} />
}

