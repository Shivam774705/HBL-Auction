import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Captain from "@/models/Captain";
import { signAccessToken, signRefreshToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const captain = await Captain.findOne({ email: email.toLowerCase() });
    if (!captain) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!captain.loginEnabled) {
      return NextResponse.json({ error: "Login is currently disabled" }, { status: 403 });
    }

    const valid = await captain.comparePassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Clear force logout flag
    if (captain.forceLogout) {
      captain.forceLogout = false;
      await captain.save();
    }

    const payload = { id: String(captain._id), role: "captain" as const, email: captain.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const isProduction = process.env.NODE_ENV === "production";
    const res = NextResponse.json({
      user: {
        id: String(captain._id),
        name: captain.name,
        email: captain.email,
        hostel: captain.hostel,
        role: "captain",
        team: captain.team,
      },
      accessToken,
    });

    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });
    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/api/auth/refresh",
    });

    return res;
  } catch (err) {
    console.error("[Auth Captain Login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
