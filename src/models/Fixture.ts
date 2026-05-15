import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFixture extends Document {
  round: number;
  matchNumber: number;
  teamA: mongoose.Types.ObjectId;
  teamB: mongoose.Types.ObjectId;
  scheduledAt?: Date;
  venue?: string;
  result?: {
    winner?: mongoose.Types.ObjectId;
    scoreA?: string;
    scoreB?: string;
    completed: boolean;
  };
}

const FixtureSchema = new Schema<IFixture>(
  {
    round: { type: Number, required: true },
    matchNumber: { type: Number, required: true },
    teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    scheduledAt: { type: Date },
    venue: { type: String },
    result: {
      winner: { type: Schema.Types.ObjectId, ref: "Team" },
      scoreA: { type: String },
      scoreB: { type: String },
      completed: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Fixture: Model<IFixture> =
  mongoose.models.Fixture || mongoose.model<IFixture>("Fixture", FixtureSchema);

export default Fixture;
