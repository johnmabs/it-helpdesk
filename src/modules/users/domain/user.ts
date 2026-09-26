import { UserRole } from "./user-role";

export type UserProps = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    const email = props.email.trim().toLowerCase();
    const name = props.name.trim();

    if (!email) {
      throw new Error("User email is required");
    }

    if (!name) {
      throw new Error("User name is required");
    }

    return new User({
      ...props,
      email,
      name,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  activate(): void {
    this.props.active = true;
  }

  deactivate(): void {
    this.props.active = false;
  }

  changeRole(role: UserRole): void {
    this.props.role = role;
  }
}
