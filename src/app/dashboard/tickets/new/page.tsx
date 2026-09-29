import { CreateTicketForm } from "./ticket-form";

export default async function NewTicketPage() {
  return (
    <main>
      <h1>Nouveau ticket</h1>

      <CreateTicketForm />
    </main>
  );
}
