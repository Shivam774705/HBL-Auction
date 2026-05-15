import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const ADMIN_ROUTES = ["/admin", "/api/admin", "/api/captains", "/api/pricing-rules", "/api/fixtures", "/api/upload"];
const SHARED_ROUTES = ["/api/players", "/api/teams", "/api/auction", "/api/standings"];
const CAPTAIN_ROUTES = ["/captain", "/auction"];
const AUTH_ROUTES = ["/api/auth"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth routes and public pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/standings") ||
    pathname.startsWith("/fixtures") ||
    pathname.startsWith("/bigscreen") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role check
  const isAdminRoute = pathname.startsWith("/admin") || ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isCaptainRoute = pathname.startsWith("/captain") || CAPTAIN_ROUTES.some((r) => pathname.startsWith(r));
  const isSharedRoute = SHARED_ROUTES.some((r) => pathname.startsWith(r));

  if (isSharedRoute) {
    return attachUserInfo(req, payload);
  }

  if (isAdminRoute && payload.role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (isCaptainRoute && payload.role !== "captain") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return attachUserInfo(req, payload);
}

function attachUserInfo(req: NextRequest, payload: any) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.id);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-email", payload.email);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
