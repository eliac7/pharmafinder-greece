import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RADIUS_OPTIONS } from '@/entities/pharmacy/model/types'

export function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const radiusParam = searchParams.get('radius')

  if (radiusParam) {
    const radius = parseInt(radiusParam, 10)
    const maxRadius = Math.max(...RADIUS_OPTIONS)

    if (!isNaN(radius) && radius > maxRadius) {
      const url = request.nextUrl.clone()
      url.searchParams.set('radius', maxRadius.toString())
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
