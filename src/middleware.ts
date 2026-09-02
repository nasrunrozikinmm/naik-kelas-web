import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIES } from "@/lib/auth/session";

// Guest-only auth routes that should redirect to dashboard if user is already authenticated
const authPrefixes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve token and role from cookies (nk_token set by frontend session)
  const token = request.cookies.get(AUTH_COOKIES.TOKEN)?.value;
  const role = request.cookies.get(AUTH_COOKIES.ROLE)?.value;
  const hasToken = Boolean(token);

  const getDashboardUrl = (userRole?: string) => {
    switch (userRole) {
      case "superadministrator":
        return "/admin/dashboard";
      case "talent":
        return "/talent/dashboard";
      case "student":
      default:
        return "/student/dashboard";
    }
  };

  // 1. Guest-Only Route Protection:
  // If user is accessing /auth/* but already has an active session
  const isAuthRoute =
    pathname.startsWith("/auth/") ||
    authPrefixes.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isAuthRoute && hasToken) {
    const targetDashboard = getDashboardUrl(role);
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  // 2. Role-Based Protected Routes:

  // Admin Routes: only superadministrator
  if (pathname.startsWith("/admin")) {
    if (!hasToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "superadministrator") {
      const targetDashboard = getDashboardUrl(role);
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  // Talent Routes: only talent or superadministrator
  if (pathname.startsWith("/talent")) {
    if (!hasToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "talent" && role !== "superadministrator") {
      const targetDashboard = getDashboardUrl(role);
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  // Student Routes: student or superadministrator
  if (pathname.startsWith("/student") || pathname.startsWith("/checkout")) {
    if (!hasToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Shared Authenticated Routes: /chat, /profile
  if (pathname.startsWith("/chat")) {
    if (!hasToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
