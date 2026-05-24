import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISubscription extends Document {
  userId:            Types.ObjectId;
  name:              string;
  category:          string;
  price:             number;
  billing:           "monthly" | "quarterly" | "annually";
  nextRenewal:       Date;
  status:            "active" | "paused" | "cancelled";
  color:             string;
  initials:          string;
  notes?:            string;
  alertsSent:        number[];
  daysUntilRenewal:  number;   // virtual
  monthlyEquivalent: number;   // virtual
}

const CATS = ["Entertainment","Music","Cloud","Design","Development",
              "Productivity","Health","Finance","Education","Other"] as const;

const PALETTE = ["#00ff87","#bf5af2","#06b6d4","#fbbf24","#f87171",
                 "#34d399","#5e6ad2","#fb923c","#e50914","#1db954"];

const Sub = new Schema<ISubscription>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name:        { type: String, required: true, trim: true, maxlength: 80 },
    category:    { type: String, enum: CATS, default: "Other" },
    price:       { type: Number, required: true, min: 0 },
    billing:     { type: String, enum: ["monthly","quarterly","annually"], default: "monthly" },
    nextRenewal: { type: Date, required: true },
    status:      { type: String, enum: ["active","paused","cancelled"], default: "active" },
    color:       { type: String, default: () => PALETTE[Math.floor(Math.random() * PALETTE.length)] },
    initials:    { type: String, default: "" },
    notes:       { type: String, maxlength: 500 },
    alertsSent:  { type: [Number], default: [] },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

Sub.virtual("daysUntilRenewal").get(function () {
  return Math.ceil((this.nextRenewal.getTime() - Date.now()) / 86_400_000);
});

Sub.virtual("monthlyEquivalent").get(function () {
  if (this.billing === "monthly")   return this.price;
  if (this.billing === "quarterly") return this.price / 3;
  return this.price / 12;
});

Sub.pre("save", function (next) {
  if (!this.initials) {
    this.initials = this.name
      .split(/\s+/)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  }
  next();
});

Sub.index({ userId: 1, status: 1 });
Sub.index({ nextRenewal: 1 });

export default mongoose.model<ISubscription>("Subscription", Sub);
