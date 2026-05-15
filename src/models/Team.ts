import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  hostel: string;
  logo?: string;
  captain: mongoose.Types.ObjectId;
  players: mongoose.Types.ObjectId[];
  benchPlayers: mongoose.Types.ObjectId[];
  totalPurse: number;
  spentPurse: number;
  remainingPurse: number;
  maxPlayers: number;
  color?: string; // hex brand color
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    hostel: { type: String, required: true, trim: true },
    logo: { type: String },
    captain: { type: Schema.Types.ObjectId, ref: "Captain", required: true },
    players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    benchPlayers: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    totalPurse: { type: Number, required: true, default: 0 },
    spentPurse: { type: Number, default: 0 },
    remainingPurse: { type: Number, default: 0 },
    maxPlayers: { type: Number, default: 15 },
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);

// Virtual for roster count
TeamSchema.virtual("rosterCount").get(function () {
  return this.players.length;
});

const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
