import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Captain from "@/models/Captain";
import Team from "@/models/Team";
import AuditLog from "@/models/AuditLog";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";
    const { captains } = await req.json();

    if (!Array.isArray(captains) || captains.length === 0) {
      return NextResponse.json({ error: "Invalid captains data" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const c of captains) {
      try {
        const rawPassword = c.password || "Captain@123";

        // Create Captain (pre-save hook will hash it and set displayPassword)
        const captain = await Captain.create({
          name: c.name,
          email: c.email.toLowerCase(),
          password: rawPassword,
          hostel: c.hostel,
          displayPassword: rawPassword,
        });

        // Create Team
        const team = await Team.create({
          name: c.teamName || `${c.hostel} Warriors`,
          hostel: c.hostel,
          captain: captain._id,
          color: c.color || "#6366f1",
          totalPurse: 0,
          remainingPurse: 0,
          spentPurse: 0,
          players: [],
        });

        // Link team to captain
        captain.team = team._id as typeof captain.team;
        await captain.save();

        results.push(captain);
      } catch (err: any) {
        errors.push({ email: c.email, error: err.message });
      }
    }

    await AuditLog.create({
      action: "bulk_captain_import",
      performedBy: adminEmail,
      details: `Imported ${results.length} captains, ${errors.length} failed`,
    });

    return NextResponse.json({
      message: `Successfully imported ${results.length} captains and teams`,
      count: results.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[Bulk Captain Import]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
