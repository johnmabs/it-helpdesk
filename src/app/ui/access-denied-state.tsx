import Link from "next/link";

import { PageState } from "./page-state";

export function AccessDeniedState() {
  return (
    <PageState
      code="403"
      title="Accès refusé"
      description="Vous ne disposez pas des permissions nécessaires pour consulter cette page."
      actions={
        <Link className="button button-primary" href="/dashboard">
          Retour au dashboard
        </Link>
      }
    />
  );
}
