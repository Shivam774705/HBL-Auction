import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Captain from "@/models/Captain";
import Auction from "@/models/Auction";

export async function GET() {
  try {
    await connectDB();
    const [playerCount, teamCount, captainCount, soldCount, unsoldCount, auction] =
      await Promise.all([
        Player.countDocuments(),
        Team.countDocuments(),
        Captain.countDocuments(),
        Player.countDocuments({ auctionStatus: "sold" }),
        Player.countDocuments({ auctionStatus: "unsold" }),
        Auction.findOne().lean(),
      ]);

    const teams = await Team.find().select("name remainingPurse spentPurse totalPurse").lean();

    return NextResponse.json({
      stats: {
        players: { total: playerCount, sold: soldCount, unsold: unsoldCount, pending: playerCount - soldCount - unsoldCount },
        teams: teamCount,
        captains: captainCount,
        auctionPhase: auction?.phase || "not_started",
        totalPurseDistributed: teams.reduce((sum, t) => sum + t.spentPurse, 0),
      },
      teams,
    });
  } catch (err) {
    console.error("[Admin Stats]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
