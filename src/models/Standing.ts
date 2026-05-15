import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStanding extends Document {
  team: mongoose.Types.ObjectId;
  played: number;
  won: number;
  lost: number;
  points: number;
  nrr?: number; // net run rate / net score difference
  position?: number;
}

const StandingSchema = new Schema<IStanding>(
  {
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    nrr: { type: Number, default: 0 },
    position: { type: Number },
  },
  { timestamps: true }
);

StandingSchema.index({ points: -1, nrr: -1 });

const Standing: Model<IStanding> =
  mongoose.models.Standing || mongoose.model<IStanding>("Standing", StandingSchema);

export default Standing;
