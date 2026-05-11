import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser, isUnauthorized } from "@/lib/api-auth";
import { parseDateOnlyToUtcNoon } from "@/lib/dates";
import Client from "@/models/Client";
import Ride from "@/models/Ride";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (isUnauthorized(authResult)) return authResult;
    const { userId } = authResult;

    const body = await request.json();
    const { clientId, pickupLocation, dropoffLocation, fare, date, notes } = body;

    if (!clientId || !pickupLocation || !dropoffLocation || fare === undefined || !date) {
      return NextResponse.json(
        { error: "clientId, pickupLocation, dropoffLocation, fare, and date are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json(
        { error: "Invalid client ID" },
        { status: 400 }
      );
    }

    const fareNum = Number(fare);
    if (isNaN(fareNum) || fareNum < 0) {
      return NextResponse.json(
        { error: "Fare must be a valid positive number" },
        { status: 400 }
      );
    }

    const parsedDate = parseDateOnlyToUtcNoon(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify client belongs to user
    const client = await Client.findOne({
      _id: clientId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const ride = await Ride.create({
      clientId: new mongoose.Types.ObjectId(clientId),
      userId: new mongoose.Types.ObjectId(userId),
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      fare: fareNum,
      date: parsedDate,
      notes: notes?.trim() || undefined,
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("Create ride error:", error);
    return NextResponse.json(
      { error: "Failed to create ride" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (isUnauthorized(authResult)) return authResult;
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    await connectDB();

    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (clientId) {
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return NextResponse.json(
          { error: "Invalid client ID" },
          { status: 400 }
        );
      }
      query.clientId = new mongoose.Types.ObjectId(clientId);
    }

    // Newest first (most recent at top) - industry standard for activity feeds
    const rides = await Ride.find(query).sort({ date: -1 }).lean();

    return NextResponse.json(rides);
  } catch (error) {
    console.error("Get rides error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rides" },
      { status: 500 }
    );
  }
}
