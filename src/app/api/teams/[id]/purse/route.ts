import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Team from "@/models/Team";
import PurseHistory from "@/models/PurseHistory";

// POST /api/teams/[id]/purse — manual admin purse adjustment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const adminName = req.headers.get("x-user-email") || "admin";
    const { amount, action, reason } = await req.json();

    if (!amount || !action || !reason) {
      return NextResponse.json({ error: "amount, action, reason required" }, { status: 400 });
    }

    const team = await Team.findById(id);
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prevPurse = team.remainingPurse;

    if (action === "credit") {
      team.remainingPurse += amount;
      team.totalPurse += amount;
    } else if (action === "debit") {
      if (team.remainingPurse < amount) {
        return NextResponse.json({ error: "Insufficient purse" }, { status: 400 });
      }
      team.remainingPurse -= amount;
      team.spentPurse += amount;
    }

    await team.save();

    await PurseHistory.create({
      team: team._id,
      action,
      amount,
      reason,
      balanceBefore: prevPurse,
      balanceAfter: team.remainingPurse,
      performedBy: adminName,
    });

    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
