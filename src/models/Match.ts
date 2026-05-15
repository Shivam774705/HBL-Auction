import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch extends Document {
  fixture: mongoose.Types.ObjectId;
  teamA: mongoose.Types.ObjectId;
  teamB: mongoose.Types.ObjectId;
  winner?: mongoose.Types.ObjectId;
  scoreA?: string;
  scoreB?: string;
  playedAt: Date;
  notes?: string;
}

const MatchSchema = new Schema<IMatch>(
  {
    fixture: { type: Schema.Types.ObjectId, ref: "Fixture" },
    teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    winner: { type: Schema.Types.ObjectId, ref: "Team" },
    scoreA: { type: String },
    scoreB: { type: String },
    playedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

export default Match;
