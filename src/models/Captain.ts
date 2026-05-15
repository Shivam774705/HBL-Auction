import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface ICaptain extends Document {
  name: string;
  email: string;
  password: string;
  hostel: string;
  displayPassword?: string;
  avatar?: string;
  team?: mongoose.Types.ObjectId;
  loginEnabled: boolean;
  forceLogout: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const CaptainSchema = new Schema<ICaptain>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    hostel: { type: String, required: true, trim: true },
    displayPassword: { type: String },
    avatar: { type: String },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    loginEnabled: { type: Boolean, default: true },
    forceLogout: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CaptainSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.displayPassword = this.password; // Store plain text before hashing
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

CaptainSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

const Captain: Model<ICaptain> =
  mongoose.models.Captain || mongoose.model<ICaptain>("Captain", CaptainSchema);

export default Captain;
