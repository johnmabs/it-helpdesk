"use client";

import { useEffect } from "react";

import { FormFeedback } from "./form-feedback";

type ActionFeedbackProps = {
  message: string;
  queryParameter?: string;
};

export function ActionFeedback({
  message,
  queryParameter,
}: ActionFeedbackProps) {
  useEffect(() => {
    if (!queryParameter) {
      return;
    }

    const url = new URL(window.location.href);

    if (!url.searchParams.has(queryParameter)) {
      return;
    }

    url.searchParams.delete(queryParameter);
    window.history.replaceState(window.history.state, "", url);
  }, [queryParameter]);

  return <FormFeedback message={message} />;
}
