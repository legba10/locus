'use client'

import { useState, useEffect, type ReactNode } from 'react'

/**
 * ClientOnly — Hydration-safe wrapper for client-only components
 * 
 * Prevents hydration mismatch by rendering children only after mount.
 * Use for components that:
 * - Access window/localStorage/navigator
 * - Use Date.now() or Math.random()
 * - Depend on client state
 * 
 * Usage:
 *   <ClientOnly>
 *     <ComponentThatUsesWindow />
 *   </ClientOnly>
 * 
 *   <ClientOnly fallback={<Skeleton />}>
 *     <DynamicContent />
 *   </ClientOnly>
 */
interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook version for more control
 */
export function useClientOnly(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

export default ClientOnly
