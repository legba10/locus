/**
 * Role utilities (единый набор: user | landlord)
 */

export type AppRole = 'user' | 'landlord'

export function normalizeRole(role: string): AppRole {
  if (role === 'ADMIN') return 'landlord'
  if (role === 'USER') return 'user'
  if (role === 'landlord' || role === 'user') return role
  return 'user'
}

export function getPrimaryRole(roles: string[]): AppRole {
  const normalized = roles.map((role) => normalizeRole(role))
  if (normalized.includes('landlord')) return 'landlord'
  return 'user'
}
