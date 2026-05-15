import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBenchPlayer extends Document {
  player: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  reason: string; // why benched (e.g., "squad overflow")
  assignedAt: Date;
}

const BenchPlayerSchema = new Schema<IBenchPlayer>(
  {
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    reason: { type: String, default: "squad overflow" },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BenchPlayer: Model<IBenchPlayer> =
  mongoose.models.BenchPlayer ||
  mongoose.model<IBenchPlayer>("BenchPlayer", BenchPlayerSchema);

export default BenchPlayer;
