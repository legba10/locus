/**
 * LOCUS Role Guard
 * 
 * PATCH 5: Role System
 * 
 * Provides role-based access control.
 * Use instead of manual role checks in components.
 */

import type { User, UserRole } from '../domain/user.model'

/**
 * Extended role type for PATCH 5
 */
export type ExtendedRole = UserRole | 'owner'

/**
 * Role hierarchy (higher index = more permissions)
 */
const ROLE_HIERARCHY: Record<ExtendedRole, number> = {
  user: 1,
  landlord: 2,
  owner: 2,
}

/**
 * Role aliases mapping
 */
const ROLE_ALIASES: Record<string, UserRole> = {
  owner: 'landlord',
}

/**
 * Normalize role to canonical form
 */
export function normalizeRole(role: ExtendedRole | string): UserRole {
  if (role in ROLE_ALIASES) {
    return ROLE_ALIASES[role]
  }
  return role as UserRole
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: ExtendedRole): boolean {
  if (!user) return false
  
  const normalizedRole = normalizeRole(role)
  
  // Check primary role
  if (user.role === normalizedRole) return true
  
  // Check roles array
  if (user.roles.includes(normalizedRole)) return true
  
  return false
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: ExtendedRole[]): boolean {
  if (!user) return false
  return roles.some(role => hasRole(user, role))
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: User | null, roles: ExtendedRole[]): boolean {
  if (!user) return false
  return roles.every(role => hasRole(user, role))
}

/**
 * Check if user's role is at least the specified level
 */
export function hasRoleAtLeast(user: User | null, role: ExtendedRole): boolean {
  if (!user) return false
  
  const requiredLevel = ROLE_HIERARCHY[role] || 0
  const userLevel = Math.max(
    ROLE_HIERARCHY[user.role] || 0,
    ...user.roles.map(r => ROLE_HIERARCHY[r] || 0)
  )
  
  return userLevel >= requiredLevel
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  if (!user) return false
  return true
}

/**
 * Check if user is owner (landlord)
 */
export function isOwner(user: User | null): boolean {
  return hasRole(user, 'landlord') || hasRole(user, 'owner')
}

/**
 * Get user's highest role
 */
/**
 * Get user's highest role
 */
export function getHighestRole(user: User | null): UserRole {
  if (!user) return 'user'
  
  const allRoles = [user.role, ...user.roles]
  let highest: UserRole = 'user'
  let highestLevel = 0
  
  for (const role of allRoles) {
    const level = ROLE_HIERARCHY[role] || 0
    if (level > highestLevel) {
      highestLevel = level
      highest = role
    }
  }
  
  return highest
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: ExtendedRole): string {
  const normalized = normalizeRole(role)
  switch (normalized) {
    case 'user': return 'Пользователь'
    case 'landlord': return 'Владелец'
    default: return 'Пользователь'
  }
}

/**
 * Role guard result
 */
export interface RoleGuardResult {
  allowed: boolean
  reason?: string
  requiredRole?: ExtendedRole
}

/**
 * Create role guard
 */
export function createRoleGuard(
  requiredRole: ExtendedRole,
  user: User | null
): RoleGuardResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'Требуется авторизация',
      requiredRole,
    }
  }
  
  if (!hasRoleAtLeast(user, requiredRole)) {
    return {
      allowed: false,
      reason: `Требуется роль: ${getRoleDisplayName(requiredRole)}`,
      requiredRole,
    }
  }
  
  return { allowed: true }
}

export default {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasRoleAtLeast,
  isAuthenticated,
  isOwner,
  isAdmin,
  isRegularUser,
  getHighestRole,
  getRoleDisplayName,
  createRoleGuard,
  normalizeRole,
}
