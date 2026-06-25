import mongoose, { Document, Schema, Types } from 'mongoose';

export type BillingCycle = 'monthly' | 'quarterly' | 'annually';
export type SubStatus = 'active' | 'paused' | 'cancelled';

export interface ISubscription extends Document {
  userId:           Types.ObjectId;
  name:             string;
  category:         string;
  price:            number;
  billing:          BillingCycle;
  nextRenewal:      Date;
  status:           SubStatus;
  color:            string;
  initials:         string;
  notes?:           string;
  alertsSent:       number[];
  createdAt:        Date;
  updatedAt:        Date;
  daysUntilRenewal: number;   // virtual
  monthlyEquivalent:number;   // virtual
}

const CATEGORY_LIST = [
  'Entertainment', 'Music', 'Cloud', 'Design', 'Development',
  'Productivity', 'Health', 'Finance', 'Education', 'Other',
] as const;

const PALETTE = [
  '#00d4ff', '#a855f7', '#34d399', '#fbbf24',
  '#f87171', '#818cf8', '#22d3ee', '#fb923c',
];

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    name: {
      type:      String,
      required:  [true, 'Subscription name is required'],
      trim:      true,
      maxlength: [80, 'Name too long'],
    },
    category: {
      type:     String,
      enum:     CATEGORY_LIST,
      default:  'Other',
    },
    price: {
      type:    Number,
      required:[true, 'Price is required'],
      min:     [0, 'Price cannot be negative'],
    },
    billing: {
      type:     String,
      enum:     ['monthly', 'quarterly', 'annually'],
      default:  'monthly',
    },
    nextRenewal: {
      type:     Date,
      required: [true, 'Next renewal date is required'],
    },
    status: {
      type:    String,
      enum:    ['active', 'paused', 'cancelled'],
      default: 'active',
    },
    color: {
      type:    String,
      default: () => PALETTE[Math.floor(Math.random() * PALETTE.length)],
    },
    initials: {
      type:    String,
      default: '',
    },
    notes: {
      type:    String,
      maxlength: [500, 'Notes too long'],
    },
    alertsSent: {
      type:    [Number],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

/* ── Virtuals ────────────────────────────────────────────────── */
SubscriptionSchema.virtual('daysUntilRenewal').get(function () {
  const diff = this.nextRenewal.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

SubscriptionSchema.virtual('monthlyEquivalent').get(function () {
  if (this.billing === 'monthly')   return this.price;
  if (this.billing === 'quarterly') return this.price / 3;
  return this.price / 12; // annually
});

/* ── Auto-generate initials ──────────────────────────────────── */
SubscriptionSchema.pre('save', function (next) {
  if (!this.initials) {
    this.initials = this.name
      .split(/\s+/)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }
  next();
});

/* ── Indexes ─────────────────────────────────────────────────── */
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ nextRenewal: 1 });   // for scheduler queries

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
