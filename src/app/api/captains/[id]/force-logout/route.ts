import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Captain from "@/models/Captain";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Captain.findByIdAndUpdate(id, { forceLogout: true });
    return NextResponse.json({ message: "Captain force-logged out" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
