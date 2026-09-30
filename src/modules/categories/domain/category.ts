import { ValidationError } from "@/shared/errors/application-error";

export type CategoryProps = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
};

export type CreateCategoryProps = Omit<
  CategoryProps,
  "description" | "active"
> & {
  description?: string | null;
};

export class Category {
  private constructor(private readonly props: CategoryProps) {}

  static create(props: CreateCategoryProps): Category {
    return new Category({
      ...props,
      name: Category.normalizeName(props.name),
      description: Category.normalizeDescription(props.description),
      active: true,
    });
  }

  static restore(props: CategoryProps): Category {
    return new Category(props);
  }

  updateDetails(name: string, description?: string | null): void {
    this.props.name = Category.normalizeName(name);
    this.props.description = Category.normalizeDescription(description);
  }

  deactivate(): void {
    this.props.active = false;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get active(): boolean {
    return this.props.active;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  private static normalizeName(name: string): string {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new ValidationError("Category name is required");
    }

    return normalizedName;
  }

  private static normalizeDescription(
    description?: string | null,
  ): string | null {
    const normalizedDescription = description?.trim();

    return normalizedDescription || null;
  }
}
