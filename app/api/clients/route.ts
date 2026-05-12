import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser, isUnauthorized } from "@/lib/api-auth";
import Client from "@/models/Client";
import mongoose from "mongoose";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (isUnauthorized(authResult)) return authResult;
    const { userId } = authResult;

    const body = await request.json();
    const { name, phone, email, notes, tags, group, defaultRate } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
      return NextResponse.json(
        { error: "Name is required (1-100 characters)" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !/^[+\d][\d\s\-().]{6,20}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: "Valid phone number is required" },
        { status: 400 }
      );
    }

    if (email && typeof email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!group || !["VIP", "Regular", "New"].includes(group)) {
      return NextResponse.json(
        { error: "Group must be VIP, Regular, or New" },
        { status: 400 }
      );
    }

    await connectDB();

    const client = await Client.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      notes: notes?.trim() || undefined,
      tags: Array.isArray(tags) ? tags : [],
      group,
      defaultRate: defaultRate ? Number(defaultRate) : undefined,
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
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
    const search = searchParams.get("search") || "";
    const group = searchParams.get("group") || "";
    const tagsParam = searchParams.getAll("tags");
    const sort = searchParams.get("sort") || "newest";

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build match stage
    const matchStage: Record<string, unknown> = { userId: userObjectId };
    if (search) {
      const escapedSearch = escapeRegex(search);
      matchStage.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
      ];
    }
    if (group) {
      matchStage.group = group;
    }
    if (tagsParam.length > 0) {
      matchStage.tags = { $all: tagsParam };
    }

    // Aggregation with rides lookup
    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "rides",
          localField: "_id",
          foreignField: "clientId",
          as: "rides",
        },
      },
      {
        $addFields: {
          rideCount: { $size: "$rides" },
          totalRevenue: { $sum: "$rides.fare" },
        },
      },
      { $project: { rides: 0 } },
    ];

    // Sort stage
    switch (sort) {
      case "alphabetical":
        pipeline.push({ $sort: { name: 1 } });
        break;
      case "rides":
        pipeline.push({ $sort: { rideCount: -1, name: 1 } });
        break;
      case "revenue":
        pipeline.push({ $sort: { totalRevenue: -1, name: 1 } });
        break;
      case "oldest":
        pipeline.push({ $sort: { createdAt: 1 } });
        break;
      case "newest":
      default:
        pipeline.push({ $sort: { createdAt: -1 } });
        break;
    }

    const clients = await Client.aggregate(pipeline);

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
