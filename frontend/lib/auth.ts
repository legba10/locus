/**
 * Auth helpers for server/middleware context.
 * TZ-1: UserRole type and getSession for admin route protection.
 */

import type { NextRequest } from 'next/server'

export type UserRole = 'user' | 'landlord' | 'admin' | 'moderator'

export interface SessionUser {
  id: string
  role?: UserRole | string
  email?: string
  [key: string]: unknown
}

export interface Session {
  user: SessionUser
}

/**
 * Get session from request (for middleware).
 * Fetches /api/auth/me with request cookies to verify auth.
 */
export async function getSession(req: NextRequest): Promise<Session | null> {
  const cookie = req.headers.get('cookie') ?? ''
  const origin = req.nextUrl.origin
  try {
    const res = await fetch(`${origin}/api/auth/me`, {
      headers: { Cookie: cookie },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.id) return null
    return {
      user: {
        id: data.id,
        role: data.role ?? 'user',
        email: data.email,
        ...data,
      },
    }
  } catch {
    return null
  }
}
