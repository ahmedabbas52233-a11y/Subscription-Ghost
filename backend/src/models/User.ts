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
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/* ── Hash password before saving ────────────────────────────── */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ── Instance method ─────────────────────────────────────────── */
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

/* ── Indexes ─────────────────────────────────────────────────── */
UserSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', UserSchema);
