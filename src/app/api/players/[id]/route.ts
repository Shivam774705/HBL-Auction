import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const player = await Player.findById(id).populate("team", "name hostel color").lean();
    if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ player });
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
    const player = await Player.findByIdAndUpdate(id, updates, { new: true });
    if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ player });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Player.findByIdAndDelete(id);
    return NextResponse.json({ message: "Player deleted" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
