import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import AuditLog from "@/models/AuditLog";
import { emitToAll } from "@/lib/socket";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminName = req.headers.get("x-user-email") || "admin";
    await Auction.updateOne({}, { phase: "paused", timerRunning: false });
    await AuditLog.create({ action: "auction_paused", performedBy: adminName, details: "Auction paused" });
    emitToAll("auctionPhase", { phase: "paused" });
    return NextResponse.json({ message: "Auction paused" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
