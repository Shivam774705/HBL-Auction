import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Bid from "@/models/Bid";
import Auction from "@/models/Auction";
import PurseHistory from "@/models/PurseHistory";
import { emitToAll } from "@/lib/socket";

export async function GET() {
  try {
    await connectDB();
    const rules = await (await import("@/models/PricingRule")).default.find().lean();
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { rules } = await req.json();
    const PricingRule = (await import("@/models/PricingRule")).default;

    const ops = rules.map((r: { category: string; year: string; basePrice: number }) =>
      PricingRule.findOneAndUpdate(
        { category: r.category, year: r.year },
        { basePrice: r.basePrice },
        { upsert: true, new: true }
      )
    );
    await Promise.all(ops);

    // Sync player base prices
    for (const r of rules) {
      await Player.updateMany(
        { category: r.category, year: r.year, auctionStatus: "pending" },
        { basePrice: r.basePrice }
      );
    }

    return NextResponse.json({ message: "Pricing rules updated and synced with players" });
  } catch (err: any) {
    console.error("[Pricing PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
