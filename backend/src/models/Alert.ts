import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAlert extends Document {
  userId:  Types.ObjectId;
  subId?:  Types.ObjectId;
  type:    "overdue"|"urgent"|"warning"|"info"|"success";
  title:   string;
  message: string;
  emoji:   string;
  read:    boolean;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subId:   { type: Schema.Types.ObjectId, ref: "Subscription" },
    type:    { type: String, enum: ["overdue","urgent","warning","info","success"], default: "info" },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    emoji:   { type: String, default: "🔔" },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

AlertSchema.index({ userId: 1, read: 1 });
AlertSchema.index({ createdAt: -1 });

export default mongoose.model<IAlert>("Alert", AlertSchema);
