import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import Player from "@/models/Player";
import { emitToAll } from "@/lib/socket";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { playerId } = await req.json();

    const player = await Player.findById(playerId);
    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });

    player.auctionStatus = "unsold";
    await player.save();

    const auction = await Auction.findOne();
    if (auction) {
      auction.unsoldPlayers.push(playerId as unknown as typeof auction.unsoldPlayers[0]);
      auction.unsoldCount++;
      await auction.save();
    }

    emitToAll("playerUnsold", { playerId, playerName: player.name });

    return NextResponse.json({ message: "Player marked unsold" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
