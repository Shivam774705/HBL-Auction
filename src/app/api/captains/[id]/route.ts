import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Captain from "@/models/Captain";
import Team from "@/models/Team";
import AuditLog from "@/models/AuditLog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const captain = await Captain.findById(id)
      .populate("team")
      .select("-password")
      .lean();
    if (!captain) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ captain });
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
    const { name, hostel, avatar } = await req.json();
    const captain = await Captain.findByIdAndUpdate(
      id,
      { ...(name && { name }), ...(hostel && { hostel }), ...(avatar && { avatar }) },
      { new: true }
    ).select("-password");
    if (!captain) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ captain });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const adminName = req.headers.get("x-user-email") || "admin";
    const captain = await Captain.findById(id);
    if (!captain) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete associated team
    await Team.findOneAndDelete({ captain: id });
    await Captain.findByIdAndDelete(id);

    await AuditLog.create({
      action: "captain_deleted",
      performedBy: adminName,
      details: `Deleted captain ${captain.name}`,
    });

    return NextResponse.json({ message: "Captain deleted" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
