"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type LoginState = {
  error: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
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
