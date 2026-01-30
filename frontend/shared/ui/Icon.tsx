import { cn } from '@/shared/utils/cn'

export type IconName = 'search' | 'sparkles' | 'shield' | 'chevronRight' | 'warning'

export function Icon({
  name,
  className,
  title,
}: {
  name: IconName
  className?: string
  title?: string
}) {
  const common = 'h-5 w-5 shrink-0'

  if (name === 'search') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn(common, className)}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : 'presentation'}
      >
        {title ? <title>{title}</title> : null}
        <path
          fill="currentColor"
          d="M10 2a8 8 0 1 1 4.9 14.3l4.4 4.4-1.4 1.4-4.4-4.4A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12Z"
        />
      </svg>
    )
  }

  if (name === 'sparkles') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn(common, className)}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : 'presentation'}
      >
        {title ? <title>{title}</title> : null}
        <path
          fill="currentColor"
          d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12l-1.2-3.4L6.6 7.4l4.2-1.2L12 2Zm7 7l.8 2.7L22.5 12l-2.7.8L19 15.5l-.8-2.7-2.7-.8 2.7-.8L19 9Zm-14 6l1 3.5L9.5 19.5 6 20.5 5 24l-1-3.5L.5 19.5 4 18.5 5 15Z"
        />
      </svg>
    )
  }

  if (name === 'shield') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn(common, className)}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : 'presentation'}
      >
        {title ? <title>{title}</title> : null}
        <path
          fill="currentColor"
          d="M12 2l8 4v7c0 5-3.4 9.4-8 10c-4.6-.6-8-5-8-10V6l8-4Zm0 2.2L6 7v6c0 3.9 2.4 7.3 6 8c3.6-.7 6-4.1 6-8V7l-6-2.8Z"
        />
      </svg>
    )
  }

  if (name === 'chevronRight') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn(common, className)}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : 'presentation'}
      >
        {title ? <title>{title}</title> : null}
        <path fill="currentColor" d="M9 6l6 6-6 6-1.4-1.4L12.2 12 7.6 7.4 9 6Z" />
      </svg>
    )
  }

  // warning
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(common, className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
    >
      {title ? <title>{title}</title> : null}
      <path
        fill="currentColor"
        d="M12 2l10 18H2L12 2Zm0 5.3L5.6 18h12.8L12 7.3Zm-1 3.7h2v4h-2v-4Zm0 6h2v2h-2v-2Z"
      />
    </svg>
  )
}

