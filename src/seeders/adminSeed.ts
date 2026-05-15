import "dotenv/config";
import mongoose from "mongoose";
import Admin from "../models/Admin";

async function seedAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set");

  await mongoose.connect(uri);
  console.log("[Seed] MongoDB connected");

  const existing = await Admin.findOne();
  if (existing) {
    console.log("[Seed] Admin already exists:", existing.email);
    return;
  }

  const admin = await Admin.create({
    name: "Admin",
    email: process.env.ADMIN_DEFAULT_EMAIL || "admin@auction.local",
    password: process.env.ADMIN_DEFAULT_PASSWORD || "Admin@1234",
  });

  console.log("[Seed] ✅ Admin created:", admin.email);
}

export default seedAdmin;
