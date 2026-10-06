import { prisma } from "@/shared/database/prisma";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store",
};

export async function GET(): Promise<Response> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json(
      {
        status: "ok",
        checks: { database: "ok" },
      },
      { headers: responseHeaders },
    );
  } catch {
    return Response.json(
      {
        status: "unhealthy",
        checks: { database: "unavailable" },
      },
      {
        status: 503,
        headers: responseHeaders,
      },
    );
  }
}
