'use client'

import { cn } from '@/shared/utils/cn'

/**
 * ТЗ-4 БЛОК 3: Единая карточка. Везде: объявления, отзывы, профиль, уведомления.
 * background: var(--bg-card), border, radius 20px, backdrop-filter blur(20px)
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]',
        'backdrop-blur-[20px] transition-shadow hover:shadow-[var(--shadow-elevated)]',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 border-b border-[var(--divider)]', className)} {...props} />
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0 border-t border-[var(--divider)]', className)} {...props} />
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-h2', className)} {...props} />
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-small mt-1', className)} {...props} />
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
Card.Title = CardTitle
Card.Description = CardDescription
