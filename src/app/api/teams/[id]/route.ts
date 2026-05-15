import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const team = await Team.findById(id)
      .populate("captain", "name email hostel avatar")
      .populate("players", "name category year photo soldPrice basePrice jerseyNumber stats")
      .lean();
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const updates = await req.json();
    const allowed = ["name", "logo", "color", "maxPlayers"];
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );
    const team = await Team.findByIdAndUpdate(id, filtered, { new: true });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
