import mongoose, { Schema, Document, Model } from "mongoose";

export type AuctionPhase = "not_started" | "active" | "paused" | "completed";

export interface IAuction extends Document {
  phase: AuctionPhase;
  currentPlayer?: mongoose.Types.ObjectId;
  currentBid: number;
  currentBidder?: mongoose.Types.ObjectId; // Team
  timerSeconds: number;
  timerRunning: boolean;
  soldCount: number;
  unsoldCount: number;
  pendingPlayers: mongoose.Types.ObjectId[];
  unsoldPlayers: mongoose.Types.ObjectId[];
  rtmAvailable: Map<string, number>; // teamId -> number of RTMs
  lastAction?: string;
  startedAt?: Date;
  endedAt?: Date;
}

const AuctionSchema = new Schema<IAuction>(
  {
    phase: {
      type: String,
      enum: ["not_started", "active", "paused", "completed"],
      default: "not_started",
    },
    currentPlayer: { type: Schema.Types.ObjectId, ref: "Player" },
    currentBid: { type: Number, default: 0 },
    currentBidder: { type: Schema.Types.ObjectId, ref: "Team" },
    timerSeconds: { type: Number, default: 60 },
    timerRunning: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },
    unsoldCount: { type: Number, default: 0 },
    pendingPlayers: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    unsoldPlayers: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    rtmAvailable: { type: Map, of: Number, default: {} },
    lastAction: { type: String },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

const Auction: Model<IAuction> =
  mongoose.models.Auction || mongoose.model<IAuction>("Auction", AuctionSchema);

export default Auction;
