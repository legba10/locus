'use client'

import { useAuthStore } from './auth-store'
import type { UserRole } from './auth-types'

/**
 * ТЗ-2: Хуки для логики рендера навигации.
 * if !auth → guest nav
 * if auth → user nav
 * if owner → owner sections
 * if admin → admin access
 */

/** Авторизован ли пользователь */
export function useAuth(): boolean {
  return useAuthStore((s) => s.isAuthenticated())
}

/** Есть ли у пользователя роль (admin, landlord, …) */
export function useRole(role: UserRole) {
  return useAuthStore((s) => s.hasRole(role))
}

/** Является ли пользователь арендодателем (есть объявление / роль landlord) */
export function useIsOwner() {
  return useAuthStore((s) => {
    const u = s.user
    if (!u) return false
    if (s.hasRole('landlord')) return true
    return ((u as any)?.listingUsed ?? 0) > 0
  })
}
