/**
 * Role utilities (единый набор: user | landlord | admin)
 */

export type AppRole = 'user' | 'landlord' | 'admin'

export function normalizeRole(role: string): AppRole {
  if (role === 'ADMIN') return 'admin'
  if (role === 'USER') return 'user'
  if (role === 'admin' || role === 'landlord' || role === 'user') return role
  return 'user'
}

export function getPrimaryRole(roles: string[]): AppRole {
  const normalized = roles.map((role) => normalizeRole(role))
  if (normalized.includes('admin')) return 'admin'
  if (normalized.includes('landlord')) return 'landlord'
  return 'user'
}
