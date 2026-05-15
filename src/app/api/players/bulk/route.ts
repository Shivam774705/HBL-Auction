import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import PricingRule from "@/models/PricingRule";
import AuditLog from "@/models/AuditLog";

// POST /api/players/bulk — import multiple players at once
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminName = req.headers.get("x-user-email") || "admin";
    const { players } = await req.json();

    if (!Array.isArray(players) || players.length === 0) {
      return NextResponse.json({ error: "players array required" }, { status: 400 });
    }

    const rules = await PricingRule.find().lean();
    const ruleMap = new Map(rules.map((r) => [`${r.category}:${r.year}`, r.basePrice]));

    const baseCount = await Player.countDocuments();
    const docs = players.map((p, i) => ({
      name: p.name,
      hostel: p.hostel,
      year: p.year,
      category: p.category,
      skills: p.skills || [],
      jerseyNumber: p.jerseyNumber,
      stats: p.stats || {},
      basePrice: ruleMap.get(`${p.category}:${p.year}`) ?? 50,
      order: baseCount + i + 1,
    }));

    const inserted = await Player.insertMany(docs);

    await AuditLog.create({
      action: "player_bulk_import",
      performedBy: adminName,
      details: `Bulk imported ${inserted.length} players`,
    });

    return NextResponse.json({ inserted: inserted.length, players: inserted }, { status: 201 });
  } catch (err) {
    console.error("[Players Bulk]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
