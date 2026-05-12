import { POST } from "@/app/api/rides/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

const mockGetAuthUser = jest.fn();

jest.mock("@/lib/api-auth", () => ({
  getAuthUser: (...a: unknown[]) => mockGetAuthUser(...a),
  isUnauthorized: (r: unknown) =>
    r &&
    typeof r === "object" &&
    "status" in (r as { status?: number }) &&
    (r as { status: number }).status === 401,
}));

const mockClientFindOne = jest.fn();
const mockRideCreate = jest.fn();

jest.mock("@/models/Client", () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockClientFindOne(...args),
  },
}));

jest.mock("@/models/Ride", () => ({
  __esModule: true,
  default: {
    create: (...args: unknown[]) => mockRideCreate(...args),
  },
}));

function req(body: unknown) {
  return new NextRequest("http://localhost/api/rides", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const clientId = "507f1f77bcf86cd799439012";

describe("/api/rides POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthUser.mockResolvedValue({ userId: "507f1f77bcf86cd799439011" });
    mockClientFindOne.mockResolvedValue({ _id: clientId });
    mockRideCreate.mockResolvedValue({ _id: "r1", fare: 25 });
  });

  test("[US-RIDE-001] missing pickup returns 400", async () => {
    const res = await POST(
      req({
        clientId,
        dropoffLocation: "Airport",
        fare: 10,
        date: "2024-01-15",
      })
    );
    expect(res.status).toBe(400);
  });

  test("[US-RIDE-001] missing dropoff returns 400", async () => {
    const res = await POST(
      req({
        clientId,
        pickupLocation: "Home",
        fare: 10,
        date: "2024-01-15",
      })
    );
    expect(res.status).toBe(400);
  });

  test("[US-RIDE-001] missing fare returns 400", async () => {
    const res = await POST(
      req({
        clientId,
        pickupLocation: "A",
        dropoffLocation: "B",
        date: "2024-01-15",
      })
    );
    expect(res.status).toBe(400);
  });

  test("[US-RIDE-001] invalid fare (NaN) returns 400", async () => {
    const res = await POST(
      req({
        clientId,
        pickupLocation: "A",
        dropoffLocation: "B",
        fare: "x",
        date: "2024-01-15",
      })
    );
    expect(res.status).toBe(400);
  });

  test("[US-RIDE-002] valid ride creation succeeds", async () => {
    const res = await POST(
      req({
        clientId,
        pickupLocation: " Here ",
        dropoffLocation: " There ",
        fare: "12.5",
        date: "2024-01-15",
        notes: "Thanks",
      })
    );
    expect(res.status).toBe(201);
    expect(mockRideCreate).toHaveBeenCalled();
  });
});
