import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUser, isUnauthorized } from "@/lib/api-auth";
import { startOfUtcDate } from "@/lib/dates";
import "@/models/Client";
import Ride from "@/models/Ride";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

function getDateRange(period: string): Date | null {
  const now = new Date();

  switch (period) {
    case "today": {
      return startOfUtcDate(now);
    }
    case "week": {
      // Monday start
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
      start.setDate(start.getDate() - diff);
      return startOfUtcDate(start);
    }
    case "month": {
      return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    }
    case "all":
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser();
    if (isUnauthorized(authResult)) return authResult;
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const dateFrom = getDateRange(period);

    const matchStage: Record<string, unknown> = { userId: userObjectId };
    if (dateFrom) {
      matchStage.date = { $gte: dateFrom };
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$fare" },
          totalRides: { $sum: 1 },
          averageFare: { $avg: "$fare" },
        },
      },
    ];

    const [summary] = await Ride.aggregate(pipeline);

    // Get top client
    const topClientPipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $group: {
          _id: "$clientId",
          total: { $sum: "$fare" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          clientName: "$client.name",
          total: 1,
        },
      },
    ];

    const [topClient] = await Ride.aggregate(topClientPipeline);

    // Get recent rides for the period
    const recentRides = await Ride.find(matchStage)
      .sort({ date: -1 })
      .limit(20)
      .populate("clientId", "name")
      .lean();

    return NextResponse.json({
      totalEarnings: summary?.totalEarnings || 0,
      totalRides: summary?.totalRides || 0,
      averageFare: summary?.averageFare || 0,
      topClient: topClient
        ? { name: topClient.clientName || "Unknown", total: topClient.total }
        : null,
      recentRides: recentRides.map((r) => ({
        _id: r._id,
        date: r.date,
        pickupLocation: r.pickupLocation,
        dropoffLocation: r.dropoffLocation,
        fare: r.fare,
        clientName:
          (r.clientId as unknown as { name: string })?.name || "Unknown",
        clientId:
          (r.clientId as unknown as { _id: string })?._id || r.clientId,
      })),
    });
  } catch (error) {
    console.error("Earnings summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings summary" },
      { status: 500 }
    );
  }
}
