import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiter (works for single-instance deployments)
// For distributed deployments (Vercel Edge), upgrade to @upstash/ratelimit
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 30
const WINDOW_MS = 60 * 1000 // 1 minute

function getRateLimitKey(request: NextRequest): string {
  // Prefer platform-injected IP (not spoofable by client) over x-forwarded-for (client-controlled)
  return (
    request.ip ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  )
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const key = getRateLimitKey(request)
  const now = Date.now()

  const entry = rateLimitMap.get(key)

  if (!entry || entry.resetAt <= now) {
    // New window
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests', retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    )
  }

  entry.count++
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
