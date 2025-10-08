import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIX = "/admin";
const LOGIN_PATH = "/auth/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("🔍 Middleware checking path:", pathname);

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Check if user is logged in via session cookie
  const isLoggedIn = req.cookies.get("isLoggedIn")?.value === "true";
  const userEmail = req.cookies.get("userEmail")?.value;

  console.log("🔍 Middleware auth check:", { isLoggedIn, userEmail, pathname });

  // If trying to access login page and already logged in, redirect to dashboard
  if (pathname === LOGIN_PATH) {
    if (isLoggedIn && userEmail) {
      console.log("🔍 Already logged in, redirecting to dashboard");
      const url = req.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If trying to access protected routes without being logged in, redirect to login
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    if (!isLoggedIn || !userEmail) {
      console.log("🔍 Not logged in, redirecting to login");
      const url = req.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/login"],
};
