import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/modules/users/domain/user-role";

declare module "next-auth" {
  interface User {
    role: UserRole;
    sessionVersion: number;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: UserRole;
    sessionVersion?: number;
    authenticatedAt?: number;
  }
}
