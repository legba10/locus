/**
 * Role utilities (единый набор: guest | host | admin)
 */

export type AppRole = 'guest' | 'host' | 'admin'

export function normalizeRole(role: string): AppRole {
  if (role === 'ADMIN') return 'admin'
  if (role === 'USER') return 'guest'
  if (role === 'guest' || role === 'host' || role === 'admin') return role
  return 'guest'
}

export function getPrimaryRole(roles: string[]): AppRole {
  const normalized = roles.map((role) => normalizeRole(role))
  if (normalized.includes('admin')) return 'admin'
  if (normalized.includes('host')) return 'host'
  return 'guest'
}
