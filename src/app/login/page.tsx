import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <p className="login-eyebrow">IT Helpdesk</p>
        <h1>Connexion</h1>
        <p className="login-description">
          Accédez à votre espace de gestion des demandes.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
