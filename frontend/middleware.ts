import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ТЗ-6: главная и публичные маршруты доступны без авторизации. Редирект на login только для /profile (в AuthProvider).
const PUBLIC_PATHS = ['/', '/auth', '/login', '/signup', '/api/auth', '/_next', '/favicon', '/logo', '/listings', '/listings/']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (PUBLIC_PATHS.some((p) => p === '/' ? pathname === '/' : pathname.startsWith(p))) {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|api|.*\\.).*)'],
}
