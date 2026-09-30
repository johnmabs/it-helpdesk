"use server";

import { revalidatePath } from "next/cache";

import { CreateCategory } from "@/modules/categories/application/create-category";
import { DeactivateCategory } from "@/modules/categories/application/deactivate-category";
import { UpdateCategory } from "@/modules/categories/application/update-category";
import { PrismaCategoryRepository } from "@/modules/categories/infrastructure/persistence/prisma-category-repository";
import {
  CategoryNameAlreadyExistsError,
  CategoryNotFoundError,
} from "@/shared/errors/application-error";
import { RandomIdGenerator } from "@/shared/identity/random-id-generator";

import { requireCategoryAdministrator } from "./require-category-administrator";

export type CategoryActionState = {
  error: string;
  message: string;
};

const categoriesPath = "/admin/categories";

export async function createCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireCategoryAdministrator();

  const name = readRequiredString(formData, "name");
  const description = readOptionalString(formData, "description");

  if (!name) {
    return failure("Le nom de la catégorie est obligatoire.");
  }

  try {
    await new CreateCategory(
      new PrismaCategoryRepository(),
      new RandomIdGenerator(),
    ).execute({ name, description });

    revalidatePath(categoriesPath);

    return success("Catégorie créée.");
  } catch (error) {
    return failure(categoryErrorMessage(error));
  }
}

export async function updateCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireCategoryAdministrator();

  const categoryId = readRequiredString(formData, "categoryId");
  const name = readRequiredString(formData, "name");
  const description = readOptionalString(formData, "description");

  if (!categoryId || !name) {
    return failure("Les données de la catégorie sont invalides.");
  }

  try {
    await new UpdateCategory(new PrismaCategoryRepository()).execute({
      categoryId,
      name,
      description,
    });

    revalidatePath(categoriesPath);

    return success("Catégorie mise à jour.");
  } catch (error) {
    return failure(categoryErrorMessage(error));
  }
}

export async function deactivateCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireCategoryAdministrator();

  const categoryId = readRequiredString(formData, "categoryId");

  if (!categoryId) {
    return failure("La catégorie est invalide.");
  }

  try {
    await new DeactivateCategory(new PrismaCategoryRepository()).execute(
      categoryId,
    );

    revalidatePath(categoriesPath);

    return success("Catégorie désactivée.");
  } catch (error) {
    return failure(categoryErrorMessage(error));
  }
}

function readRequiredString(formData: FormData, field: string): string | null {
  const value = formData.get(field);

  return typeof value === "string" && value.trim() ? value : null;
}

function readOptionalString(formData: FormData, field: string): string | null {
  const value = formData.get(field);

  return typeof value === "string" && value.trim() ? value : null;
}

function categoryErrorMessage(error: unknown): string {
  if (error instanceof CategoryNameAlreadyExistsError) {
    return "Une catégorie avec ce nom existe déjà.";
  }

  if (error instanceof CategoryNotFoundError) {
    return "Catégorie introuvable.";
  }

  return "Impossible d'enregistrer la catégorie.";
}

function failure(error: string): CategoryActionState {
  return { error, message: "" };
}

function success(message: string): CategoryActionState {
  return { error: "", message };
}
