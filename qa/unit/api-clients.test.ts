import { NextRequest } from "next/server";

const mockCreate = jest.fn();

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/models/Client", () => ({
  __esModule: true,
  default: { create: (...a: unknown[]) => mockCreate(...a) },
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

import { POST } from "@/app/api/clients/route";

function req(body: unknown) {
  return new NextRequest("http://localhost/api/clients", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/clients POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthUser.mockResolvedValue({ userId: "507f1f77bcf86cd799439011" });
    mockCreate.mockResolvedValue({
      _id: "507f1f77bcf86cd799439012",
      name: "Jane",
      toObject: () => ({ _id: "507f1f77bcf86cd799439012", name: "Jane" }),
    });
  });

  test("[US-CLIENT-002] missing name returns 400", async () => {
    const res = await POST(
      req({ phone: "+15551234567", group: "New" })
    );
    expect(res.status).toBe(400);
  });

  test("[US-CLIENT-002] missing phone returns 400", async () => {
    const res = await POST(req({ name: "Jane", group: "New" }));
    expect(res.status).toBe(400);
  });

  test("[US-CLIENT-002] invalid group enum returns 400", async () => {
    const res = await POST(
      req({ name: "Jane", phone: "+15551234567", group: "Platinum" })
    );
    expect(res.status).toBe(400);
  });

  test("[US-CLIENT-001] valid client creation succeeds", async () => {
    const res = await POST(
      req({
        name: "Jane",
        phone: "+1 (555) 123-4567",
        group: "VIP",
        tags: ["Airport", "Business"],
      })
    );
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalled();
  });

  test("[US-CLIENT-002] tags default to array when not array", async () => {
    await POST(
      req({
        name: "Jane",
        phone: "+15551234567",
        group: "Regular",
        tags: "oops",
      })
    );
    const call = mockCreate.mock.calls[0][0];
    expect(call.tags).toEqual([]);
  });
});
