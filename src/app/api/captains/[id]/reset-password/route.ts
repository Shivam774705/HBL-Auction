import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Captain from "@/models/Captain";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    const captain = await Captain.findById(id);
    if (!captain) return NextResponse.json({ error: "Not found" }, { status: 404 });

    captain.password = password; // pre-save hook hashes it
    await captain.save();

    return NextResponse.json({ message: "Password reset" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
