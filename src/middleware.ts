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

  // Retrieve token and role from cookies (support both nk_* and legacy vision_*)
  const token =
    request.cookies.get(AUTH_COOKIES.TOKEN)?.value ||
    request.cookies.get("vision_token")?.value;
  const role =
    request.cookies.get(AUTH_COOKIES.ROLE)?.value ||
    request.cookies.get("vision_role")?.value;
  const hasToken = Boolean(token);

  let userRoles: string[] = [];
  const rawUser =
    request.cookies.get(AUTH_COOKIES.USER)?.value ||
    request.cookies.get("vision_user")?.value;
  if (rawUser) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawUser));
      if (Array.isArray(parsed.roles)) {
        userRoles = parsed.roles;
      }
    } catch {
      // ignore
    }
  }
  if (role && !userRoles.includes(role)) {
    userRoles.push(role);
  }

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
    const isAdmin = userRoles.includes("superadministrator");
    if (!isAdmin) {
      const targetDashboard = getDashboardUrl(role);
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  }

  // Talent Routes:
  if (pathname.startsWith("/talent")) {
    if (!hasToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Halaman /talent/profile diperbolehkan untuk SEMUA pengguna terautentikasi (termasuk calon talent)
    if (!pathname.startsWith("/talent/profile")) {
      const isTalentOrAdmin =
        userRoles.includes("talent") || userRoles.includes("superadministrator");
      if (!isTalentOrAdmin) {
        // Jika belum memiliki profil/role talent, arahkan ke verifikasi profil talent
        return NextResponse.redirect(new URL("/talent/profile", request.url));
      }
    }
  }

  // Student & Checkout Routes: Semua pengguna terautentikasi
  if (pathname.startsWith("/student") || pathname.startsWith("/checkout")) {
    if (!hasToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Shared Authenticated Routes: /chat
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
