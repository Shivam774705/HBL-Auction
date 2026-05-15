import "dotenv/config";
import mongoose from "mongoose";
import PricingRule from "../models/PricingRule";

const DEFAULT_RULES = [
  // Icon
  { category: "Icon", year: "1st", basePrice: 500 },
  { category: "Icon", year: "2nd", basePrice: 500 },
  { category: "Icon", year: "3rd", basePrice: 500 },
  { category: "Icon", year: "4th", basePrice: 500 },
  // Top
  { category: "Top", year: "1st", basePrice: 300 },
  { category: "Top", year: "2nd", basePrice: 300 },
  { category: "Top", year: "3rd", basePrice: 300 },
  { category: "Top", year: "4th", basePrice: 300 },
  // Best
  { category: "Best", year: "1st", basePrice: 200 },
  { category: "Best", year: "2nd", basePrice: 200 },
  { category: "Best", year: "3rd", basePrice: 200 },
  { category: "Best", year: "4th", basePrice: 200 },
  // Good
  { category: "Good", year: "1st", basePrice: 150 },
  { category: "Good", year: "2nd", basePrice: 150 },
  { category: "Good", year: "3rd", basePrice: 150 },
  { category: "Good", year: "4th", basePrice: 150 },
  // Average
  { category: "Average", year: "1st", basePrice: 100 },
  { category: "Average", year: "2nd", basePrice: 100 },
  { category: "Average", year: "3rd", basePrice: 100 },
  { category: "Average", year: "4th", basePrice: 100 },
  // Base
  { category: "Base", year: "1st", basePrice: 50 },
  { category: "Base", year: "2nd", basePrice: 50 },
  { category: "Base", year: "3rd", basePrice: 50 },
  { category: "Base", year: "4th", basePrice: 50 },
];

async function seedPricingRules() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set");

  await mongoose.connect(uri);
  console.log("[Seed] MongoDB connected");

  let created = 0;
  for (const rule of DEFAULT_RULES) {
    const exists = await PricingRule.findOne({ category: rule.category, year: rule.year });
    if (!exists) {
      await PricingRule.create(rule);
      created++;
    }
  }

  console.log(`[Seed] ✅ Pricing rules: ${created} created, ${DEFAULT_RULES.length - created} already existed`);
}

export default seedPricingRules;
