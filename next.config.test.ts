import { describe, expect, it } from "vitest";

import nextConfig, { createSecurityHeaders } from "./next.config";

function asRecord(environment: "development" | "production" | "test") {
  return Object.fromEntries(
    createSecurityHeaders(environment).map(({ key, value }) => [key, value]),
  );
}

describe("HTTP security headers", () => {
  it("applies browser security boundaries to every route", async () => {
    const rules = await nextConfig.headers?.();
    const headers = asRecord("test");

    expect(nextConfig.poweredByHeader).toBe(false);
    expect(rules).toEqual([
      {
        source: "/:path*",
        headers: createSecurityHeaders("test"),
      },
    ]);
    expect(headers).toMatchObject({
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-Permitted-Cross-Domain-Policies": "none",
      "X-XSS-Protection": "0",
    });
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });

  it("uses a restrictive content security policy", () => {
    const policy = asRecord("production")["Content-Security-Policy"];

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("enables transport security only in production", () => {
    expect(asRecord("production")["Strict-Transport-Security"]).toBe(
      "max-age=31536000; includeSubDomains",
    );
    expect(asRecord("development")).not.toHaveProperty(
      "Strict-Transport-Security",
    );
    expect(asRecord("test")).not.toHaveProperty("Strict-Transport-Security");
  });

  it("allows the development runtime without weakening production", () => {
    const developmentPolicy = asRecord("development")[
      "Content-Security-Policy"
    ];
    const productionPolicy = asRecord("production")[
      "Content-Security-Policy"
    ];

    expect(developmentPolicy).toContain("'unsafe-eval'");
    expect(developmentPolicy).toContain("connect-src 'self' ws: wss:");
    expect(productionPolicy).not.toContain("'unsafe-eval'");
    expect(productionPolicy).toContain("connect-src 'self'");
  });
});
