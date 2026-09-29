import { ListCategories } from "@/modules/categories/application/list-categories";
import { PrismaCategoryRepository } from "@/modules/categories/infrastructure/persistence/prisma-category-repository";

import { CreateTicketForm } from "./ticket-form";

export default async function NewTicketPage() {
  const categories = await new ListCategories(
    new PrismaCategoryRepository(),
  ).execute({ activeOnly: true });

  return (
    <main>
      <h1>Nouveau ticket</h1>

      <CreateTicketForm categories={categories} />
    </main>
  );
}
