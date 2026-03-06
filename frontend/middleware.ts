import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

// ТЗ-6: главная и публичные маршруты доступны без авторизации. Редирект на login только для /profile (в AuthProvider).
const PUBLIC_PATHS = ['/', '/auth', '/login', '/signup', '/api/auth', '/_next', '/favicon', '/logo', '/listings', '/listings/']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // TZ-1: защита роута /admin — только для role === "admin"
  if (pathname.startsWith('/admin')) {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + encodeURIComponent(pathname), request.url))
    }
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (PUBLIC_PATHS.some((p) => p === '/' ? pathname === '/' : pathname.startsWith(p))) {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|api|.*\\.).*)'],
}
