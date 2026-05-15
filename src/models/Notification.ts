import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType =
  | "bid_placed"
  | "player_sold"
  | "player_unsold"
  | "auction_started"
  | "auction_paused"
  | "auction_ended"
  | "rtm_used"
  | "purse_updated"
  | "system";

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  message: string;
  recipient?: mongoose.Types.ObjectId; // null = broadcast to all
  recipientRole?: "admin" | "captain" | "all";
  read: boolean;
  data?: Record<string, unknown>;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: [
        "bid_placed", "player_sold", "player_unsold",
        "auction_started", "auction_paused", "auction_ended",
        "rtm_used", "purse_updated", "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: Schema.Types.ObjectId },
    recipientRole: { type: String, enum: ["admin", "captain", "all"], default: "all" },
    read: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
