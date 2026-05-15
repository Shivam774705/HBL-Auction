import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/models/Player";
import AuditLog from "@/models/AuditLog";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";
    const { playerIds } = await req.json();

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json({ error: "No player IDs provided" }, { status: 400 });
    }

    const result = await Player.deleteMany({ _id: { $in: playerIds } });

    await AuditLog.create({
      action: "bulk_player_delete",
      performedBy: adminEmail,
      details: `Deleted ${result.deletedCount} selected players`,
    });

    return NextResponse.json({ message: `Deleted ${result.deletedCount} players`, count: result.deletedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
