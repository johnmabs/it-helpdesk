import { describe, expect, it } from "vitest";

import { authConfig } from "./auth.config";

describe("authentication route protection", () => {
  it("anonymous user cannot access dashboard", () => {
    const authorized = authConfig.callbacks.authorized({
      auth: null,
      request: {
        nextUrl: new URL("http://localhost/dashboard"),
      },
    } as never);

    expect(authorized).toBe(false);
  });

  it("anonymous user cannot access administration pages", () => {
    const authorized = authConfig.callbacks.authorized({
      auth: null,
      request: {
        nextUrl: new URL("http://localhost/dashboard/categories"),
      },
    } as never);

    expect(authorized).toBe(false);
  });
});
