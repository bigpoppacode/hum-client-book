import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser, isUnauthorized } from "@/lib/api-auth";
import Client from "@/models/Client";
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
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    await connectDB();

    const client = await Client.findOne({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Get client error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
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
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, phone, email, notes, tags, group, defaultRate } = body;

    // Validation
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
        return NextResponse.json(
          { error: "Name must be 1-100 characters" },
          { status: 400 }
        );
      }
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || !/^[+\d][\d\s\-().]{6,20}$/.test(phone.trim())) {
        return NextResponse.json(
          { error: "Valid phone number is required" },
          { status: 400 }
        );
      }
    }

    if (email !== undefined && email !== "" && typeof email === "string") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return NextResponse.json(
          { error: "Tags must be an array" },
          { status: 400 }
        );
      }
      if (!tags.every((t: unknown) => typeof t === "string")) {
        return NextResponse.json(
          { error: "All tags must be strings" },
          { status: 400 }
        );
      }
    }

    if (group !== undefined && !["VIP", "Regular", "New"].includes(group)) {
      return NextResponse.json(
        { error: "Group must be VIP, Regular, or New" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateFields: Record<string, unknown> = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (email !== undefined) updateFields.email = email.trim() || undefined;
    if (notes !== undefined) updateFields.notes = notes.trim();
    if (tags !== undefined) updateFields.tags = tags;
    if (group !== undefined) updateFields.group = group;
    if (defaultRate !== undefined) updateFields.defaultRate = defaultRate ? Number(defaultRate) : undefined;

    const client = await Client.findOneAndUpdate(
      { _id: params.id, userId: new mongoose.Types.ObjectId(userId) },
      { $set: updateFields },
      { new: true }
    );

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
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
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    await connectDB();

    const client = await Client.findOneAndDelete({
      _id: params.id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Also delete associated rides (scoped to userId for defense-in-depth)
    await Ride.deleteMany({ clientId: params.id, userId: new mongoose.Types.ObjectId(userId) });

    return NextResponse.json({ message: "Client deleted" });
  } catch (error) {
    console.error("Delete client error:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
