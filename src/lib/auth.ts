import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export interface JWTPayload {
  id: string;
  role: "admin" | "captain";
  email: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export function signAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromCookies(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function getAuthFromRequest(req: NextRequest): JWTPayload | null {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifyAccessToken(token);
  }
  // Try cookie
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): Response {
  const isProduction = process.env.NODE_ENV === "production";
  const accessMaxAge = 15 * 60; // 15 minutes
  const refreshMaxAge = 7 * 24 * 60 * 60; // 7 days

  const newHeaders = new Headers(res.headers);
  newHeaders.append(
    "Set-Cookie",
    `access_token=${accessToken}; HttpOnly; Path=/; Max-Age=${accessMaxAge}; SameSite=Strict${isProduction ? "; Secure" : ""}`
  );
  newHeaders.append(
    "Set-Cookie",
    `refresh_token=${refreshToken}; HttpOnly; Path=/api/auth/refresh; Max-Age=${refreshMaxAge}; SameSite=Strict${isProduction ? "; Secure" : ""}`
  );

  return new Response(res.body, { status: res.status, headers: newHeaders });
}

export function clearAuthCookies(): { headers: Headers } {
  const headers = new Headers();
  headers.append("Set-Cookie", "access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict");
  headers.append(
    "Set-Cookie",
    "refresh_token=; HttpOnly; Path=/api/auth/refresh; Max-Age=0; SameSite=Strict"
  );
  return { headers };
}
