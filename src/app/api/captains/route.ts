import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Captain from "@/models/Captain";
import Team from "@/models/Team";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  try {
    await connectDB();
    const captains = await Captain.find().populate("team").lean();
    return NextResponse.json({ captains });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";
    const { name, email, password, hostel, color } = await req.json();

    if (!name || !email || !password || !hostel) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await Captain.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Captain already exists" }, { status: 400 });

    const captain = await Captain.create({
      name,
      email: email.toLowerCase(),
      password, // Model pre-save hashes this
      hostel,
    });

    const team = await Team.create({
      name: `${hostel} Warriors`,
      hostel,
      captain: captain._id,
      color: color || "#6366f1",
    });

    captain.team = team._id as any;
    await captain.save();

    await AuditLog.create({
      action: "captain_created",
      performedBy: adminEmail,
      details: `Created captain ${name} and team ${team.name}`,
    });

    return NextResponse.json({ captain, team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE all captains
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const adminEmail = req.headers.get("x-user-email") || "admin";
    
    // Delete all captains and their teams
    await Team.deleteMany({});
    const deleted = await Captain.deleteMany({});

    await AuditLog.create({
      action: "all_captains_deleted",
      performedBy: adminEmail,
      details: `Deleted all ${deleted.deletedCount} captains and their teams`,
    });

    return NextResponse.json({ message: "All captains and teams deleted", count: deleted.deletedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
