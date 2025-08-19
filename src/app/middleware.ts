import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes yang mau di-protect
const protectedRoutes = ["/dashboard", "/dashboard/:path*"]

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  // Middleware ini server-side, jadi kita gak bisa akses localStorage
  // Kita redirect dulu ke /login kalau akses route protected
  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Apply ke semua route
export const config = {
  matcher: ["/dashboard/:path*"],
}
