<<<<<<< HEAD
import mongoose, { Document, Schema, Types } from 'mongoose';

export type AlertType = 'overdue' | 'urgent' | 'warning' | 'info' | 'success';
=======
import mongoose, { Document, Schema, Types } from "mongoose";
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699

export interface IAlert extends Document {
  userId:  Types.ObjectId;
  subId?:  Types.ObjectId;
<<<<<<< HEAD
  type:    AlertType;
=======
  type:    "overdue"|"urgent"|"warning"|"info"|"success";
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
  title:   string;
  message: string;
  emoji:   string;
  read:    boolean;
<<<<<<< HEAD
  createdAt: Date;
=======
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
}

const AlertSchema = new Schema<IAlert>(
  {
<<<<<<< HEAD
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    subId: {
      type: Schema.Types.ObjectId,
      ref:  'Subscription',
    },
    type: {
      type: String,
      enum: ['overdue', 'urgent', 'warning', 'info', 'success'],
      default: 'info',
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    emoji:   { type: String, default: '🔔' },
=======
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subId:   { type: Schema.Types.ObjectId, ref: "Subscription" },
    type:    { type: String, enum: ["overdue","urgent","warning","info","success"], default: "info" },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    emoji:   { type: String, default: "🔔" },
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

AlertSchema.index({ userId: 1, read: 1 });
AlertSchema.index({ createdAt: -1 });

<<<<<<< HEAD
export default mongoose.model<IAlert>('Alert', AlertSchema);
=======
export default mongoose.model<IAlert>("Alert", AlertSchema);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
