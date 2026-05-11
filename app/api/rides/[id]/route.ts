import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser, isUnauthorized } from "@/lib/api-auth";
import { parseDateOnlyToUtcNoon } from "@/lib/dates";
import Ride from "@/models/Ride";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUser();
    if (isUnauthorized(authResult)) return authResult;
    const { userId } = authResult;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid ride ID" }, { status: 400 });
    }

    await connectDB();

    const ride = await Ride.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json(ride);
  } catch (error) {
    console.error("Get ride error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ride" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUser();
    if (isUnauthorized(authResult)) return authResult;
    const { userId } = authResult;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid ride ID" }, { status: 400 });
    }

    const body = await request.json();
    const { pickupLocation, dropoffLocation, fare, date, notes } = body;

    const updateFields: Record<string, unknown> = {};
    if (pickupLocation !== undefined) updateFields.pickupLocation = pickupLocation.trim();
    if (dropoffLocation !== undefined) updateFields.dropoffLocation = dropoffLocation.trim();
    if (fare !== undefined) {
      const fareNum = Number(fare);
      if (isNaN(fareNum) || fareNum < 0) {
        return NextResponse.json(
          { error: "Fare must be a valid positive number" },
          { status: 400 }
        );
      }
      updateFields.fare = fareNum;
    }
    if (date !== undefined) {
      const parsedDate = parseDateOnlyToUtcNoon(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      updateFields.date = parsedDate;
    }
    if (notes !== undefined) updateFields.notes = notes.trim();

    await connectDB();

    const ride = await Ride.findOneAndUpdate(
      { _id: params.id, userId: new mongoose.Types.ObjectId(userId) },
      { $set: updateFields },
      { new: true }
    );

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json(ride);
  } catch (error) {
    console.error("Update ride error:", error);
    return NextResponse.json(
      { error: "Failed to update ride" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthUser();
    if (isUnauthorized(authResult)) return authResult;
    const { userId } = authResult;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid ride ID" }, { status: 400 });
    }

    await connectDB();

    const ride = await Ride.findOneAndDelete({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ride deleted" });
  } catch (error) {
    console.error("Delete ride error:", error);
    return NextResponse.json(
      { error: "Failed to delete ride" },
      { status: 500 }
    );
  }
}
