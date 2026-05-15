import mongoose, { Schema, Document, Model } from "mongoose";

export type PurseAction = "debit" | "credit" | "init";

export interface IPurseHistory extends Document {
  team: mongoose.Types.ObjectId;
  action: PurseAction;
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  player?: mongoose.Types.ObjectId;
  performedBy?: string; // "admin" or captain name
}

const PurseHistorySchema = new Schema<IPurseHistory>(
  {
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    action: { type: String, enum: ["debit", "credit", "init"], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    player: { type: Schema.Types.ObjectId, ref: "Player" },
    performedBy: { type: String },
  },
  { timestamps: true }
);

PurseHistorySchema.index({ team: 1, createdAt: -1 });

const PurseHistory: Model<IPurseHistory> =
  mongoose.models.PurseHistory ||
  mongoose.model<IPurseHistory>("PurseHistory", PurseHistorySchema);

export default PurseHistory;
