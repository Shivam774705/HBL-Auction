import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import Player from "@/models/Player";
import { emitToAll } from "@/lib/socket";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { playerId } = await req.json();

    const auction = await Auction.findOne();
    if (!auction) return NextResponse.json({ error: "No auction" }, { status: 404 });

    const player = await Player.findById(playerId)
      .populate("team", "name hostel color")
      .lean();

    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    // Update auction state
    auction.currentPlayer = playerId as unknown as typeof auction.currentPlayer;
    auction.currentBid = player.basePrice;
    auction.currentBidder = undefined;
    await auction.save();

    emitToAll("newPlayer", { player, basePrice: player.basePrice });

    return NextResponse.json({ player });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
