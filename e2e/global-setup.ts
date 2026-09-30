import { execFileSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for E2E setup");
}

if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) {
  throw new Error("E2E setup refuses to clean a non-test database");
}

export default function globalSetup(): void {
  execFileSync(
    "pnpm",
    [
      "exec",
      "prisma",
      "migrate",
      "deploy",
      "--config",
      "prisma7.config.ts",
    ],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    },
  );

  execFileSync("pnpm", ["exec", "tsx", "e2e/seed-test-database.ts"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
}
