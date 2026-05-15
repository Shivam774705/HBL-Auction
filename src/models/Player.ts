import mongoose, { Schema, Document, Model } from "mongoose";

export type PlayerCategory = "Icon" | "Top" | "Best" | "Good" | "Average" | "Base";
export type PlayerYear = "1st" | "2nd" | "3rd" | "4th";
export type AuctionStatus = "pending" | "sold" | "unsold" | "rtm";

export interface IPlayer extends Document {
  name: string;
  hostel: string;
  year: PlayerYear;
  category: PlayerCategory;
  photo?: string;
  basePrice: number;
  soldPrice?: number;
  team?: mongoose.Types.ObjectId;
  auctionStatus: AuctionStatus;
  isCaptain: boolean;
  skills?: string[];
  jerseyNumber?: number;
  stats?: {
    matchesPlayed?: number;
    wins?: number;
    rank?: number;
  };
  order?: number; // auction sequence order
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true, trim: true },
    hostel: { type: String, required: true, trim: true },
    year: {
      type: String,
      enum: ["1st", "2nd", "3rd", "4th"],
      required: true,
    },
    category: {
      type: String,
      enum: ["Icon", "Top", "Best", "Good", "Average", "Base"],
      required: true,
    },
    photo: { type: String },
    basePrice: { type: Number, required: true },
    soldPrice: { type: Number },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    auctionStatus: {
      type: String,
      enum: ["pending", "sold", "unsold", "rtm"],
      default: "pending",
    },
    isCaptain: { type: Boolean, default: false },
    skills: [{ type: String }],
    jerseyNumber: { type: Number },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      rank: { type: Number },
    },
    order: { type: Number },
  },
  { timestamps: true }
);

PlayerSchema.index({ auctionStatus: 1, order: 1 });
PlayerSchema.index({ team: 1 });

const Player: Model<IPlayer> =
  mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;
