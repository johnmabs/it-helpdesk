import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));

vi.mock("@/auth", () => ({
  signIn: mocks.signIn,
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

import { loginAction } from "./actions";

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes valid credentials before authentication", async () => {
    const formData = new FormData();
    formData.set("email", " USER@EXAMPLE.COM ");
    formData.set("password", " password ");

    await loginAction({ error: "" }, formData);

    expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: " password ",
      redirectTo: "/dashboard",
    });
  });

  it("rejects malformed credentials before authentication", async () => {
    const formData = new FormData();
    formData.set("email", "invalid-email");
    formData.set("password", "");

    await expect(loginAction({ error: "" }, formData)).resolves.toEqual({
      error: "Email ou mot de passe incorrect.",
    });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});
