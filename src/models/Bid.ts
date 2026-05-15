import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBid extends Document {
  auction: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  captain: mongoose.Types.ObjectId;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

const BidSchema = new Schema<IBid>(
  {
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true },
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    captain: { type: Schema.Types.ObjectId, ref: "Captain", required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    isWinning: { type: Boolean, default: false },
  },
  { timestamps: false }
);

BidSchema.index({ player: 1, timestamp: -1 });
BidSchema.index({ team: 1, timestamp: -1 });

const Bid: Model<IBid> =
  mongoose.models.Bid || mongoose.model<IBid>("Bid", BidSchema);

export default Bid;
