import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import PurseHistory from "@/models/PurseHistory";

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find()
      .populate("captain", "name email hostel avatar")
      .populate("players", "name category year photo soldPrice basePrice")
      .lean();
    return NextResponse.json({ teams });
  } catch (err: any) {
    console.error("[Teams API Error]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
