import "dotenv/config";

import { defineConfig } from "vitest/config";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for integration tests");
}

const testDatabaseName = new URL(testDatabaseUrl).pathname
  .slice(1)
  .toLowerCase();

if (!testDatabaseName.includes("test")) {
  throw new Error(
    "Integration tests require a database name containing 'test'",
  );
}

process.env.DATABASE_URL = testDatabaseUrl;

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    fileParallelism: false,
    globalSetup: ["./src/shared/tests/prisma-integration-global-setup.ts"],
    include: ["./src/**/*.integration.test.ts"],
  },
});
