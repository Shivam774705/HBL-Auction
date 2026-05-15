import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const adminId = req.headers.get("x-user-id");
    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ admin });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const adminId = req.headers.get("x-user-id");
    const { name, avatar, password } = await req.json();

    const admin = await Admin.findById(adminId);
    if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (name) admin.name = name;
    if (avatar) admin.avatar = avatar;
    if (password) admin.password = password;
    await admin.save();

    await AuditLog.create({
      action: "captain_updated",
      performedBy: admin.name,
      details: "Admin profile updated",
    });

    return NextResponse.json({ admin: { id: admin._id, name: admin.name, email: admin.email, avatar: admin.avatar } });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
