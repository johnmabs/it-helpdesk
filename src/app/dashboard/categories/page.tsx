import Link from "next/link";

import { EmptyState } from "@/app/ui/empty-state";
import { ListCategories } from "@/modules/categories/application/list-categories";
import { PrismaCategoryRepository } from "@/modules/categories/infrastructure/persistence/prisma-category-repository";

import {
  CreateCategoryForm,
  DeactivateCategoryForm,
  UpdateCategoryForm,
} from "./category-forms";
import { requireCategoryAdministrator } from "./require-category-administrator";

export default async function CategoriesPage() {
  await requireCategoryAdministrator();

  const categories = await new ListCategories(
    new PrismaCategoryRepository(),
  ).execute();

  return (
    <main>
      <header className="page-heading">
        <div>
          <Link href="/dashboard">Retour au tableau de bord</Link>
          <h1>Administration des catégories</h1>
        </div>
      </header>

      <section>
        <h2>Nouvelle catégorie</h2>
        <CreateCategoryForm />
      </section>

      <section>
        <h2>Catégories</h2>

        {categories.length === 0 ? (
          <EmptyState
            title="Aucune catégorie pour le moment."
            description="Utilisez le formulaire ci-dessus pour créer la première catégorie."
          />
        ) : (
          <ul className="entity-list">
            {categories.map((category) => (
              <li key={category.id}>
                <UpdateCategoryForm category={category} />
                <p>
                  Créée le {category.createdAt.toLocaleString("fr-FR")} ·{" "}
                  {category.active ? "Active" : "Inactive"}
                </p>
                <DeactivateCategoryForm category={category} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
