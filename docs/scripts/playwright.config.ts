import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

import baseConfig from "../../playwright.config";

const root = resolve(__dirname, "../..");
const databaseUrl = process.env.TEST_DATABASE_URL;

// The shared E2E setup clears this database before seeding fictional users.
if (!databaseUrl || new URL(databaseUrl).pathname !== "/it_helpdesk_test") {
  throw new Error("Portfolio captures require the disposable it_helpdesk_test database");
}

export default defineConfig({
  ...baseConfig,
  testDir: ".",
  testMatch: "capture-screenshots.capture.ts",
  globalSetup: resolve(root, "e2e/global-setup.ts"),
  workers: 1,
  retries: 0,
  timeout: 120_000,
  projects: [{
    name: "chromium",
    use: {
      browserName: "chromium",
      viewport: { width: 1440, height: 960 },
      locale: "fr-FR",
      timezoneId: "UTC",
    },
  }],
  webServer: {
    ...baseConfig.webServer,
    command: "pnpm dev --port 3100",
    cwd: root,
  },
});
