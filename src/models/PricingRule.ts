import mongoose, { Schema, Document, Model } from "mongoose";
import type { PlayerCategory, PlayerYear } from "./Player";

export interface IPricingRule extends Document {
  category: PlayerCategory;
  year: PlayerYear;
  basePrice: number;
}

const PricingRuleSchema = new Schema<IPricingRule>(
  {
    category: {
      type: String,
      enum: ["Icon", "Top", "Best", "Good", "Average", "Base"],
      required: true,
    },
    year: {
      type: String,
      enum: ["1st", "2nd", "3rd", "4th"],
      required: true,
    },
    basePrice: { type: Number, required: true },
  },
  { timestamps: true }
);

// Unique combination
PricingRuleSchema.index({ category: 1, year: 1 }, { unique: true });

const PricingRule: Model<IPricingRule> =
  mongoose.models.PricingRule ||
  mongoose.model<IPricingRule>("PricingRule", PricingRuleSchema);

export default PricingRule;
