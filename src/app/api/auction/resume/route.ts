import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import AuditLog from "@/models/AuditLog";
import { emitToAll } from "@/lib/socket";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminName = req.headers.get("x-user-email") || "admin";
    await Auction.updateOne({}, { phase: "active" });
    await AuditLog.create({ action: "auction_resumed", performedBy: adminName, details: "Auction resumed" });
    emitToAll("auctionPhase", { phase: "active" });
    return NextResponse.json({ message: "Auction resumed" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
