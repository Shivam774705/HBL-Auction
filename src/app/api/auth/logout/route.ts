import { NextResponse } from "next/server";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set("access_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  res.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 0,
    path: "/api/auth/refresh",
  });

  return res;
}
