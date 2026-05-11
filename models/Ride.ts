import mongoose, { Schema, Document } from "mongoose";

export interface IRide extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

const RideSchema = new Schema<IRide>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
      trim: true,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

RideSchema.index({ clientId: 1, date: -1 });
RideSchema.index({ userId: 1, date: -1 });

export default mongoose.models.Ride ||
  mongoose.model<IRide>("Ride", RideSchema);
