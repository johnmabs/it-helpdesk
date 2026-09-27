import { User } from "./user";
import { UserRole } from "./user-role";

export type PersistUserInput = {
  user: User;
  passwordHash: string;
};

export type AuthenticationUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  sessionVersion: number;
};

export type UserSessionState = {
  active: boolean;
  sessionVersion: number;
};

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findForAuthentication(email: string): Promise<AuthenticationUser | null>;
  findSessionState(userId: string): Promise<UserSessionState | null>;
  revokeSessions(userId: string): Promise<void>;
  create(input: PersistUserInput): Promise<void>;
  save(user: User): Promise<void>;
}
