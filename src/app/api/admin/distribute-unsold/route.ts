import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import AuditLog from "@/models/AuditLog";
import PurseHistory from "@/models/PurseHistory";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";

    const unsoldPlayers = await Player.find({ auctionStatus: "unsold" });
    const teams = await Team.find();

    if (unsoldPlayers.length === 0) {
      return NextResponse.json({ message: "No unsold players to distribute" });
    }

    if (teams.length === 0) {
      return NextResponse.json({ error: "No teams found" }, { status: 400 });
    }

    // Shuffle unsold players
    const shuffledPlayers = [...unsoldPlayers].sort(() => Math.random() - 0.5);

    for (const player of shuffledPlayers) {
      // Find team with fewest players
      const targetTeam = teams.sort((a, b) => (a.players?.length || 0) - (b.players?.length || 0))[0];
      
      const prevPurse = targetTeam.remainingPurse;
      const cost = player.basePrice || 0;

      // Update player
      player.auctionStatus = "sold";
      player.soldPrice = cost;
      player.team = targetTeam._id as typeof player.team;
      await player.save();

      // Update team
      targetTeam.players.push(player._id as typeof targetTeam.players[0]);
      targetTeam.spentPurse += cost;
      targetTeam.remainingPurse -= cost;
      await targetTeam.save();

      // Purse history
      await PurseHistory.create({
        team: targetTeam._id,
        action: "debit",
        amount: cost,
        reason: `Assigned unsold player: ${player.name}`,
        balanceBefore: prevPurse,
        balanceAfter: targetTeam.remainingPurse,
        player: player._id,
        performedBy: adminEmail,
      });
    }

    await AuditLog.create({
      action: "unsold_distributed",
      performedBy: adminEmail,
      details: `Distributed ${unsoldPlayers.length} unsold players among ${teams.length} teams.`,
    });

    return NextResponse.json({ 
      message: `Successfully distributed ${unsoldPlayers.length} players.`,
      count: unsoldPlayers.length
    });
  } catch (err: any) {
    console.error("[Distribute Unsold]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
