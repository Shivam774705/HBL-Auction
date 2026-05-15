import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import AuditLog from "@/models/AuditLog";
import PricingRule from "@/models/PricingRule";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const query: any = {};
    if (status) query.auctionStatus = status;
    if (category) query.category = category;

    const players = await Player.find(query).populate("team", "name color").lean();
    return NextResponse.json({ players });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";
    const { name, hostel, year, category, skills } = await req.json();

    const rule = await PricingRule.findOne({ category, year });
    const basePrice = rule ? rule.basePrice : 50;

    const player = await Player.create({
      name,
      hostel,
      year,
      category,
      skills,
      basePrice,
      auctionStatus: "pending",
    });

    await AuditLog.create({
      action: "player_created",
      performedBy: adminEmail,
      details: `Created player ${name} with base price ${basePrice}`,
    });

    return NextResponse.json({ player });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE all players
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";
    
    const deleted = await Player.deleteMany({});

    await AuditLog.create({
      action: "all_players_deleted",
      performedBy: adminEmail,
      details: `Deleted all ${deleted.deletedCount} players`,
    });

    return NextResponse.json({ message: "All players deleted", count: deleted.deletedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
