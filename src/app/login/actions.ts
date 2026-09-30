"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { loginRequestSchema } from "@/shared/validation/request-schemas";

export type LoginState = {
  error: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const request = loginRequestSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!request.success) {
    return {
      error: "Email ou mot de passe incorrect.",
    };
  }

  try {
    await signIn("credentials", {
      email: request.data.email,
      password: request.data.password,
      redirectTo: "/dashboard",
    });

    return {
      error: "",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Email ou mot de passe incorrect.",
      };
    }

    throw error;
  }
}
