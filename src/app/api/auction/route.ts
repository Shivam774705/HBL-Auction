import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import Player from "@/models/Player";
import Team from "@/models/Team";

// GET current auction state
export async function GET() {
  try {
    await connectDB();
    const auction = await Auction.findOne()
      .populate("currentPlayer")
      .populate("currentBidder", "name hostel color")
      .lean();
    return NextResponse.json({ auction: auction || { phase: "not_started" } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
