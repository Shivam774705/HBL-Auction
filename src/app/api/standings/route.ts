import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Standing from "@/models/Standing";

export async function GET() {
  try {
    await connectDB();
    const standings = await Standing.find()
      .populate("team", "name hostel color logo")
      .sort({ points: -1, nrr: -1 })
      .lean();

    const ranked = standings.map((s, i) => ({ ...s, position: i + 1 }));
    return NextResponse.json({ standings: ranked });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
