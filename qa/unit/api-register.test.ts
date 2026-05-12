import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue("hashed-password"),
  },
}));

const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: (...args: unknown[]) => mockFindOne(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

function req(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: "user1" });
  });

  test("[US-AUTH-001] missing required fields returns 400", async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  test("[US-AUTH-001] invalid email format returns 400", async () => {
    const res = await POST(
      req({ name: "Test", email: "bad", password: "secret12" })
    );
    expect(res.status).toBe(400);
  });

  test("[US-AUTH-001] short password returns 400", async () => {
    const res = await POST(
      req({ name: "Test", email: "a@b.co", password: "12345" })
    );
    expect(res.status).toBe(400);
  });

  test("[US-AUTH-001] duplicate email returns 409", async () => {
    mockFindOne.mockResolvedValueOnce({ email: "x@y.com" });
    const res = await POST(
      req({ name: "Test", email: "x@y.com", password: "secret12" })
    );
    expect(res.status).toBe(409);
  });

  test("[US-AUTH-001] valid registration succeeds with 201", async () => {
    const res = await POST(
      req({ name: " Test ", email: "NEW@EXAMPLE.COM", password: "secret12" })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.userId).toBeDefined();
  });
});
