/**
 * LOCUS Domain Model — User
 * 
 * ARCHITECTURE LOCK:
 * Single source of truth for user data structure.
 * All auth responses MUST be adapted to this model.
 */

/**
 * User role
 */
export type UserRole = 'guest' | 'tenant' | 'landlord' | 'admin'

/**
 * Auth provider
 */
export type AuthProvider = 'email' | 'phone' | 'telegram' | 'google'

/**
 * User domain model
 */
export interface User {
  // Identity
  id: string
  supabaseId: string
  
  // Profile
  email?: string
  phone?: string
  name?: string
  avatar?: string
  
  // Auth
  role: UserRole
  roles: UserRole[]
  provider?: AuthProvider
  
  // Metadata
  createdAt?: string
  lastLoginAt?: string
  isVerified?: boolean
}

/**
 * Auth state
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'anonymous' | 'error'

/**
 * Auth session
 */
export interface AuthSession {
  user: User | null
  accessToken: string | null
  status: AuthStatus
  error?: string
}

/**
 * Type guard
 */
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).supabaseId === 'string'
  )
}

/**
 * Check if user has role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false
  return user.roles.includes(role) || user.role === role
}

/**
 * Check if user has any of roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.some(role => hasRole(user, role))
}
