import { Suspense } from 'react'
import PageClient from './PageClient'

export const dynamic = 'force-dynamic'

/** ТЗ-3: fallback без img — только div, чтобы не было битой иконки при гидрации */
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[var(--bg-main)]" aria-hidden />}>
      <PageClient />
    </Suspense>
  )
}
