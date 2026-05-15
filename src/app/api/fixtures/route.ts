import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Fixture from "@/models/Fixture";
import Team from "@/models/Team";
import Standing from "@/models/Standing";

// GET /api/fixtures
export async function GET() {
  try {
    await connectDB();
    const fixtures = await Fixture.find()
      .populate("teamA", "name hostel color logo")
      .populate("teamB", "name hostel color logo")
      .populate("result.winner", "name")
      .sort({ round: 1, matchNumber: 1 })
      .lean();
    return NextResponse.json({ fixtures });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/fixtures/generate — round-robin fixture generation
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const teams = await Team.find().lean();

    if (teams.length < 2) {
      return NextResponse.json({ error: "Need at least 2 teams" }, { status: 400 });
    }

    // Delete existing fixtures
    await Fixture.deleteMany({});

    const fixtureList = [];
    let matchNumber = 1;

    for (let r = 1; r < teams.length; r++) {
      for (let i = 0; i < teams.length - 1; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          if ((i + j) % (teams.length - 1) === r % (teams.length - 1)) {
            fixtureList.push({
              round: r,
              matchNumber: matchNumber++,
              teamA: teams[i]._id,
              teamB: teams[j]._id,
              result: { completed: false },
            });
          }
        }
      }
    }

    const inserted = await Fixture.insertMany(fixtureList);

    // Initialize standings
    await Standing.deleteMany({});
    await Standing.insertMany(teams.map((t) => ({ team: t._id })));

    return NextResponse.json({ message: `Generated ${inserted.length} fixtures`, fixtures: inserted });
  } catch (err) {
    console.error("[Fixtures Generate]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
