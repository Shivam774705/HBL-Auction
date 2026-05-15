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
    const captain = await Captain.findById(id);
    if (!captain) return NextResponse.json({ error: "Not found" }, { status: 404 });

    captain.loginEnabled = !captain.loginEnabled;
    await captain.save();

    return NextResponse.json({ loginEnabled: captain.loginEnabled });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
