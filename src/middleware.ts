import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting sederhana menggunakan Map (untuk produksi gunakan Upstash Redis)
const rateMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs })
    return true // Allowed
  }

  if (entry.count >= limit) return false // Blocked

  entry.count++
  return true
}

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/login':          { limit: 5,  windowMs: 60_000 },
  '/api/auth/register':       { limit: 3,  windowMs: 60_000 },
  '/api/pendaftaran/upload':  { limit: 10, windowMs: 600_000 },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Rate Limiting ────────────────────────────────────────
  const matchedRoute = Object.keys(RATE_LIMITS).find(r => pathname.startsWith(r))
  if (matchedRoute) {
    const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? 'unknown'
    const key = `${ip}:${matchedRoute}`
    const { limit, windowMs } = RATE_LIMITS[matchedRoute]

    if (!getRateLimit(key, limit, windowMs)) {
      return new NextResponse(
        JSON.stringify({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }),
        {
          status:  429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After':  '60',
          },
        }
      )
    }
  }

  // ─── NextAuth Session ────────────────────────────────
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // ─── Route Protection ─────────────────────────────────────
  const isAuthPage   = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isAdminPage  = pathname.startsWith('/admin')
  const isPesertaPage = pathname.startsWith('/peserta')

  // Redirect unauthenticated users
  if (!token && (isAdminPage || isPesertaPage)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (token && isAuthPage) {
    if (token.role === 'admin_prodi' || token.role === 'admin_fakultas') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/peserta/dashboard', request.url))
  }

  // Admin page protection
  if (isAdminPage && token) {
    if (token.role !== 'admin_prodi' && token.role !== 'admin_fakultas') {
      return NextResponse.redirect(new URL('/peserta/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
