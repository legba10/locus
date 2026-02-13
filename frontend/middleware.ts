/**
 * TZ-6: не редиректить на login для публичных маршрутов.
 * Редирект на /auth/login только для защищённых путей и только при отсутствии сессии (проверка на клиенте).
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = [
  '/',
  '/search',
  '/listings',
  '/listings/',
  '/auth/login',
  '/auth/register',
  '/auth/telegram',
  '/auth/telegram/complete',
  '/help',
  '/about',
  '/contacts',
  '/terms',
  '/privacy',
  '/pricing',
  '/how-it-works',
  '/safety',
  '/blog',
]

function isPublicPath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/'
  return publicRoutes.some((route) => path === route || path.startsWith(route + '/'))
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|api|.*\\.).*)'],
}
