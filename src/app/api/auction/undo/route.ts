import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Auction from "@/models/Auction";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Bid from "@/models/Bid";
import PurseHistory from "@/models/PurseHistory";
import AuditLog from "@/models/AuditLog";
import { emitToAll } from "@/lib/socket";

// Undo last sale — reverts player to pending, refunds purse
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminName = req.headers.get("x-user-email") || "admin";
    const { playerId } = await req.json();

    const player = await Player.findById(playerId);
    if (!player || player.auctionStatus !== "sold") {
      return NextResponse.json({ error: "Player is not sold" }, { status: 400 });
    }

    const team = await Team.findById(player.team);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const soldPrice = player.soldPrice || 0;
    const prevPurse = team.remainingPurse;

    // Revert player
    player.auctionStatus = "pending";
    player.soldPrice = undefined;
    player.team = undefined;
    await player.save();

    // Revert team
    team.players = team.players.filter((p) => String(p) !== playerId);
    team.spentPurse -= soldPrice;
    team.remainingPurse += soldPrice;
    await team.save();

    // Log refund
    await PurseHistory.create({
      team: team._id,
      action: "credit",
      amount: soldPrice,
      reason: `Undo: refund for ${player.name}`,
      balanceBefore: prevPurse,
      balanceAfter: team.remainingPurse,
      player: player._id,
      performedBy: adminName,
    });

    // Remove winning bids
    await Bid.deleteMany({ player: playerId, isWinning: true });

    // Update auction
    await Auction.updateOne({}, { $inc: { soldCount: -1 } });

    await AuditLog.create({
      action: "player_undo",
      performedBy: adminName,
      details: `Undo sale of ${player.name} from ${team.name}`,
    });

    emitToAll("bidUndo", { playerId, teamId: team._id, refund: soldPrice });
    emitToAll("purseUpdate", { teamId: team._id, remaining: team.remainingPurse, spent: team.spentPurse });

    return NextResponse.json({ message: "Sale undone", player });
  } catch (err) {
    console.error("[Auction Undo]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
