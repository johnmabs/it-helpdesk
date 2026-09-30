import { execFileSync } from "node:child_process";

export function setup(): void {
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
}
