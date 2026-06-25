<<<<<<< HEAD
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name:           string;
  email:          string;
  password:       string;
  plan:           'free' | 'pro' | 'team';
  refreshTokens:  string[];
  createdAt:      Date;
  updatedAt:      Date;
=======
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name:          string;
  email:         string;
  password:      string;
  plan:          "free" | "pro" | "team";
  refreshTokens: string[];
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
<<<<<<< HEAD
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type:       String,
      required:   [true, 'Email is required'],
      unique:     true,
      lowercase:  true,
      trim:       true,
      match:      [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,   // never returned in queries by default
    },
    plan: {
      type:    String,
      enum:    ['free', 'pro', 'team'],
      default: 'free',
    },
    refreshTokens: {
      type:    [String],
      default: [],
      select:  false,
    },
=======
    name:     { type: String, required: true, trim: true, maxlength: 60 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    plan:     { type: String, enum: ["free","pro","team"], default: "free" },
    refreshTokens: { type: [String], default: [], select: false },
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  },
  {
    timestamps: true,
    toJSON: {
<<<<<<< HEAD
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
=======
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
      },
    },
  }
);

<<<<<<< HEAD
/* ── Hash password before saving ────────────────────────────── */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
=======
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

<<<<<<< HEAD
/* ── Instance method ─────────────────────────────────────────── */
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

/* ── Indexes ─────────────────────────────────────────────────── */
UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);
=======
UserSchema.methods.comparePassword = function (c: string) {
  return bcrypt.compare(c, this.password);
};

UserSchema.index({ email: 1 });

export default mongoose.model<IUser>("User", UserSchema);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
