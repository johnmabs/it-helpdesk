import Link from "next/link";

import { PageState } from "@/app/ui/page-state";

export default function NotFound() {
  return (
    <PageState
      code="404"
      title="Page introuvable"
      description="La page demandée n’existe pas ou n’est plus disponible."
      actions={
        <Link className="button button-primary" href="/dashboard">
          Retour au dashboard
        </Link>
      }
    />
  );
}
