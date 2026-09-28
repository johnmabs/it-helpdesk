import { requireAuthenticatedUser } from "@/modules/auth/application/require-authenticated-user";

import { CreateTicketForm } from "./ticket-form";

export default async function NewTicketPage() {
  await requireAuthenticatedUser();

  return (
    <main>
      <h1>Nouveau ticket</h1>

      <CreateTicketForm />
    </main>
  );
}
