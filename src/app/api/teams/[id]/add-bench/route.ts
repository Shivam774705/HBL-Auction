import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import AuditLog from "@/models/AuditLog";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const teamId = params.id;
    const { playerId } = await req.json();
    const adminEmail = req.headers.get("x-user-email") || "admin";

    const team = await Team.findById(teamId);
    const player = await Player.findById(playerId);

    if (!team || !player) {
      return NextResponse.json({ error: "Team or Player not found" }, { status: 404 });
    }

    if (player.auctionStatus !== "unsold") {
      return NextResponse.json({ error: "Only unsold players can be added to the bench" }, { status: 400 });
    }

    // Add to bench
    team.benchPlayers.push(player._id as any);
    
    // Deduct base price from purse
    if (team.remainingPurse < player.basePrice) {
      return NextResponse.json({ error: "Insufficient purse to add to bench" }, { status: 400 });
    }

    team.remainingPurse -= player.basePrice;
    team.spentPurse += player.basePrice;
    await team.save();

    // Update player status
    player.auctionStatus = "sold";
    player.soldPrice = player.basePrice;
    player.team = team._id as any;
    await player.save();

    await AuditLog.create({
      action: "bench_player_added",
      performedBy: adminEmail,
      details: `Added ${player.name} to ${team.name} as bench player for ₹${player.basePrice}`,
    });

    return NextResponse.json({ message: "Player added to bench", team, player });
  } catch (err: any) {
    console.error("[Add Bench Player]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
