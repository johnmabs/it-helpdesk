"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PageState } from "@/app/ui/page-state";

type ApplicationErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ApplicationError({
  error,
  retry,
}: ApplicationErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageState
      code="500"
      title="Une erreur est survenue"
      description="L’application n’a pas pu terminer cette opération. Vous pouvez réessayer dans quelques instants."
      actions={
        <>
          <button
            className="button button-primary"
            type="button"
            onClick={retry}
          >
            Réessayer
          </button>
          <Link className="button button-secondary" href="/dashboard">
            Retour au dashboard
          </Link>
        </>
      }
    />
  );
}
