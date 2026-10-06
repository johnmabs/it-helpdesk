import type { Metadata } from "next";

import { AccessDeniedState } from "@/app/ui/access-denied-state";

export const metadata: Metadata = {
  title: "Accès refusé",
};

export default function AccessDeniedPage() {
  return <AccessDeniedState />;
}
