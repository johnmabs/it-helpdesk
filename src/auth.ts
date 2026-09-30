import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";

import { LoginUser } from "./modules/auth/application/login-user";
import { ArgonPasswordHasher } from "./modules/auth/infrastructure/security/argon-password-hasher";
import { PrismaUserRepository } from "./modules/users/infrastructure/persistence/prisma-user-repository";
import { loginRequestSchema } from "./shared/validation/request-schemas";

const users = new PrismaUserRepository();
const passwordHasher = new ArgonPasswordHasher();

const loginUser = new LoginUser(users, passwordHasher);

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 heures
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.sessionVersion = user.sessionVersion;
        token.role = user.role;
        token.authenticatedAt = Date.now();

        return token;
      }

      if (
        typeof token.userId !== "string" ||
        typeof token.role !== "string" ||
        typeof token.sessionVersion !== "number" ||
        typeof token.authenticatedAt !== "number"
      ) {
        return null;
      }

      const absoluteLifetime = 8 * 60 * 60 * 1000;

      if (
        typeof token.authenticatedAt !== "number" ||
        Date.now() - token.authenticatedAt >= absoluteLifetime
      ) {
        return null;
      }

      const state = await users.findSessionState(token.userId);

      if (!state?.active || state.sessionVersion !== token.sessionVersion) {
        return null;
      }

      return token;
    },

    session({ session, token }) {
      if (
        session.user &&
        typeof token.userId === "string" &&
        token.role
      ) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }

      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const request = loginRequestSchema.safeParse(credentials);

        if (!request.success) {
          return null;
        }

        try {
          const result = await loginUser.execute(request.data);

          return {
            id: result.userId,
            email: result.email,
            role: result.role,
            sessionVersion: result.sessionVersion,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
