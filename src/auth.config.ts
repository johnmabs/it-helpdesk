import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isProtectedRoute =
        nextUrl.pathname === "/dashboard" ||
        nextUrl.pathname.startsWith("/dashboard/");

      if (isProtectedRoute) {
        return Boolean(auth?.user);
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
