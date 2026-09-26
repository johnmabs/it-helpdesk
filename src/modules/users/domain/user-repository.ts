import { User } from "./user";

export type PersistUserInput = {
  user: User;
  passwordHash: string;
};

export type AuthenticationUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  active: boolean;
};

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findForAuthentication(email: string): Promise<AuthenticationUser | null>;
  create(input: PersistUserInput): Promise<void>;
  save(user: User): Promise<void>;
}
