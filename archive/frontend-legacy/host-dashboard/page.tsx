'use client'

import { Suspense } from 'react'
import PageClient from './PageClient'

export const dynamic = 'force-dynamic'

export default function HostDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageClient />
    </Suspense>
  )
}

