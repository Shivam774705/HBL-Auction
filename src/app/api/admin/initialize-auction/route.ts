import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Auction from "@/models/Auction";
import AuditLog from "@/models/AuditLog";
import PurseHistory from "@/models/PurseHistory";
import Bid from "@/models/Bid";
import BenchPlayer from "@/models/BenchPlayer";
import { emitToAll } from "@/lib/socket";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";

    const [teams, players] = await Promise.all([
      Team.find(),
      Player.find()
    ]);

    if (teams.length === 0) {
      return NextResponse.json({ error: "No teams found. Add captains first." }, { status: 400 });
    }

    // 1. Calculate Initial Purse
    const totalBasePrice = players.reduce((sum, p) => sum + (p.basePrice || 100), 0);
    const pursePerTeam = Math.ceil((totalBasePrice / teams.length) * 1.5);

    // 2. WIPE ALL AUCTION DATA & HISTORY
    await Promise.all([
      Player.updateMany({}, {
        auctionStatus: "pending",
        soldPrice: 0,
        team: null
      }),
      Team.updateMany({}, {
        totalPurse: pursePerTeam,
        remainingPurse: pursePerTeam,
        spentPurse: 0,
        players: [],
        maxPlayers: players.length
      }),
      PurseHistory.deleteMany({}),
      AuditLog.deleteMany({}),
      Bid.deleteMany({}),
      BenchPlayer.deleteMany({})
    ]);

    // 3. Reset Auction Global State
    let auction = await Auction.findOne();
    if (auction) {
      auction.phase = "not_started";
      auction.currentPlayer = undefined;
      auction.currentBid = 0;
      auction.currentBidder = undefined;
      auction.soldCount = 0;
      auction.unsoldCount = 0;
      auction.timerSeconds = 60;
      auction.timerRunning = false;
      auction.pendingPlayers = []; // Will be repopulated if needed by logic
      auction.unsoldPlayers = [];
      await auction.save();
    } else {
      await Auction.create({
        phase: "not_started",
        soldCount: 0,
        unsoldCount: 0,
        timerSeconds: 60
      });
    }

    // 4. Create a fresh log for the reset
    await AuditLog.create({
      action: "system_full_reset",
      performedBy: adminEmail,
      details: "Hard reset performed. All auction history, bids, and purse transactions have been permanently removed.",
    });

    // Notify all clients to clear their UI
    emitToAll("auctionReset", { pursePerTeam, totalPlayers: players.length });
    
    emitToAll("auctionState", {
      phase: "not_started",
      currentPlayer: null,
      currentBid: 0,
      currentBidder: null,
      soldCount: 0,
      unsoldCount: 0,
      timerSeconds: 60,
      timerRunning: false
    });

    return NextResponse.json({
      message: "HARD RESET SUCCESSFUL: All history and data removed.",
      pursePerTeam,
      totalTeams: teams.length,
      totalPlayers: players.length
    });
  } catch (err: any) {
    console.error("[Hard Reset Error]", err);
    return NextResponse.json({ error: "Server error during hard reset" }, { status: 500 });
  }
}
