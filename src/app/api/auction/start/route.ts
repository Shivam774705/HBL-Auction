import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import Player from "@/models/Player";
import Team from "@/models/Team";
import AuditLog from "@/models/AuditLog";
import { emitToAll } from "@/lib/socket";
import { calculatePursePerTeam } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminName = req.headers.get("x-user-email") || "admin";

    // Recalculate purses
    const players = await Player.find({ auctionStatus: "pending" }).lean();
    const teams = await Team.find().lean();

    if (teams.length === 0) {
      return NextResponse.json({ error: "No teams registered" }, { status: 400 });
    }

    const totalBase = players.reduce((s, p) => s + p.basePrice, 0);
    const pursePerTeam = calculatePursePerTeam(totalBase, teams.length);

    // Reset all purses
    await Team.updateMany({}, { totalPurse: pursePerTeam, remainingPurse: pursePerTeam, spentPurse: 0 });

    const pendingIds = players.map((p) => p._id);
    const firstPlayer = players[0] || null;

    // Upsert auction document
    await Auction.findOneAndUpdate(
      {},
      {
        phase: "active",
        currentPlayer: firstPlayer?._id,
        currentBid: firstPlayer?.basePrice || 0,
        currentBidder: null,
        timerSeconds: 60,
        timerRunning: false,
        soldCount: 0,
        unsoldCount: 0,
        pendingPlayers: pendingIds,
        unsoldPlayers: [],
        rtmAvailable: {},
        startedAt: new Date(),
        endedAt: null,
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      action: "auction_started",
      performedBy: adminName,
      details: `Auction started with ${players.length} players and ${teams.length} teams`,
    });

    emitToAll("auctionPhase", { phase: "active", pursePerTeam });
    if (firstPlayer) {
      emitToAll("newPlayer", { player: firstPlayer, basePrice: firstPlayer.basePrice });
    }

    return NextResponse.json({ message: "Auction started", pursePerTeam });
  } catch (err) {
    console.error("[Auction Start]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
