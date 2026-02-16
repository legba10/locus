'use client'

import type { ReactNode } from 'react'

export function HomePageLayout({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={className}>{children}</div>
}
