import "dotenv/config";
import mongoose from "mongoose";
import seedAdmin from "./adminSeed";
import seedPricingRules from "./pricingRulesSeed";

async function main() {
  try {
    await seedAdmin();
    await seedPricingRules();
    console.log("\n✅ All seeds complete!");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("[Seed] Disconnected from MongoDB");
  }
}

main();
