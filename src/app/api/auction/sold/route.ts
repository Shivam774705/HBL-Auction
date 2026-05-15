import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import Player from "@/models/Player";
import Team from "@/models/Team";
import PurseHistory from "@/models/PurseHistory";
import AuditLog from "@/models/AuditLog";
import { emitToAll } from "@/lib/socket";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminName = req.headers.get("x-user-email") || "admin";
    const { playerId, teamId, soldPrice } = await req.json();

    const [player, team, auction] = await Promise.all([
      Player.findById(playerId),
      Team.findById(teamId),
      Auction.findOne(),
    ]);

    if (!player || !team || !auction) {
      return NextResponse.json({ error: "Missing player, team or auction" }, { status: 404 });
    }

    if (team.remainingPurse < soldPrice) {
      return NextResponse.json({ error: "Insufficient purse" }, { status: 400 });
    }

    const prevPurse = team.remainingPurse;

    // Update player
    player.auctionStatus = "sold";
    player.soldPrice = soldPrice;
    player.team = team._id as typeof player.team;
    await player.save();

    // Update team
    team.players.push(player._id as typeof team.players[0]);
    team.spentPurse += soldPrice;
    team.remainingPurse -= soldPrice;
    await team.save();

    // Purse history
    await PurseHistory.create({
      team: team._id,
      action: "debit",
      amount: soldPrice,
      reason: `Purchased ${player.name}`,
      balanceBefore: prevPurse,
      balanceAfter: team.remainingPurse,
      player: player._id,
      performedBy: adminName,
    });

    // Update auction
    auction.soldCount++;
    auction.currentBid = 0;
    auction.currentBidder = undefined;
    await auction.save();

    await AuditLog.create({
      action: "player_sold",
      performedBy: adminName,
      details: `${player.name} sold to ${team.name} for ₹${soldPrice}`,
      metadata: { playerId, teamId, soldPrice },
    });

    emitToAll("playerSold", {
      player: { _id: player._id, name: player.name, photo: player.photo, category: player.category },
      team: { _id: team._id, name: team.name, color: team.color },
      soldPrice,
    });
    emitToAll("purseUpdate", { teamId: team._id, remaining: team.remainingPurse, spent: team.spentPurse });

    return NextResponse.json({ message: "Player sold", player, team });
  } catch (err) {
    console.error("[Auction Sold]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
