type FormFeedbackProps = {
  error?: string;
  id?: string;
  message?: string;
};

export function FormFeedback({ error, id, message }: FormFeedbackProps) {
  if (error) {
    return (
      <p
        id={id}
        className="form-feedback form-feedback-error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  return message ? (
    <p
      id={id}
      className="form-feedback form-feedback-success"
      role="status"
    >
      {message}
    </p>
  ) : null;
}
