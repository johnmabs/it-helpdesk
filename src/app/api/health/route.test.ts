import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
}));

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
  },
}));

import { GET } from "./route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports a healthy application when PostgreSQL is reachable", async () => {
    mocks.queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      checks: { database: "ok" },
    });
  });

  it("reports an unavailable application when PostgreSQL cannot be reached", async () => {
    mocks.queryRaw.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: "unhealthy",
      checks: { database: "unavailable" },
    });
  });
});
