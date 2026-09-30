import { defineConfig, devices } from "@playwright/test";
import { config as loadEnvironment } from "dotenv";

loadEnvironment({ quiet: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for E2E tests");
}

const testDatabaseName = new URL(testDatabaseUrl).pathname
  .slice(1)
  .toLowerCase();

if (!testDatabaseName.includes("test")) {
  throw new Error("E2E tests require a database name containing 'test'");
}

process.env.DATABASE_URL = testDatabaseUrl;

const inheritedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  ),
);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: "pnpm dev --port 3100",
    env: {
      ...inheritedEnvironment,
      AUTH_SECRET:
        process.env.AUTH_SECRET ??
        "e2e-only-auth-secret-with-at-least-32-characters",
      DATABASE_URL: testDatabaseUrl,
    },
    gracefulShutdown: {
      signal: "SIGTERM",
      timeout: 1_000,
    },
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
  },
});
