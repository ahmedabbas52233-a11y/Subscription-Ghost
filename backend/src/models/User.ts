import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name:          string;
  email:         string;
  password:      string;
  plan:          "free" | "pro" | "team";
  refreshTokens: string[];
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true, maxlength: 60 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    plan:     { type: String, enum: ["free","pro","team"], default: "free" },
    refreshTokens: { type: [String], default: [], select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
      },
    },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (c: string) {
  return bcrypt.compare(c, this.password);
};

UserSchema.index({ email: 1 });

export default mongoose.model<IUser>("User", UserSchema);
