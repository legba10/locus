'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/domains/auth'
import { buildPermissions, type Permissions, type PermissionsContext } from './permissions'

/**
 * TZ-66: Централизованный хук прав.
 * Использовать вместо проверок user.role / hasRole в компонентах.
 *
 * @param context.listingOwnerId — id владельца объявления (на странице объявления)
 */
export function usePermissions(context: PermissionsContext = {}): Permissions {
  const user = useAuthStore((s) => s.user)
  return useMemo(() => buildPermissions(user, context), [user, context.listingOwnerId])
}
