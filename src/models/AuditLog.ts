import mongoose, { Schema, Document, Model } from "mongoose";

export type AuditAction =
  | "admin_login" | "captain_created" | "captain_deleted" | "captain_updated"
  | "player_created" | "player_deleted" | "player_bulk_import"
  | "auction_started" | "auction_paused" | "auction_resumed" | "auction_ended" | "auction_reset"
  | "bid_placed" | "player_sold" | "player_unsold" | "player_undo"
  | "purse_adjusted" | "pricing_rule_updated" | "fixture_generated";

export interface IAuditLog extends Document {
  action: AuditAction;
  performedBy: string; // admin name or system
  details: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true }
);

AuditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
