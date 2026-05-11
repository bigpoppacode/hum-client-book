import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tags: string[];
  group: "VIP" | "Regular" | "New";
  defaultRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    group: {
      type: String,
      enum: ["VIP", "Regular", "New"],
      required: true,
      default: "New",
    },
    defaultRate: {
      type: Number,
    },
  },
  { timestamps: true }
);

ClientSchema.index({ userId: 1, name: 1 });
ClientSchema.index({ userId: 1, phone: 1 });

export default mongoose.models.Client ||
  mongoose.model<IClient>("Client", ClientSchema);
