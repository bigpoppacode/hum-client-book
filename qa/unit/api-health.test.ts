import { GET } from "@/app/api/health/route";

describe("/api/health", () => {
  test("GET returns 200 with { status: ok }", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: "ok" });
  });
});
