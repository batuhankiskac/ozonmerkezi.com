"use client";

import { startTransition, useActionState, useState } from "react";
import type { FormState } from "@/app/admin/actions";
import { IMAGE_TOO_LARGE_MESSAGE, MAX_UPLOAD_BYTES } from "@/lib/validation";
import SubmitButton from "./SubmitButton";
import styles from "./AdminForm.module.css";

interface AdminActionFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  children: React.ReactNode;
}

export default function AdminActionForm({
  action,
  submitLabel,
  children,
}: AdminActionFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [clientError, setClientError] = useState<string | null>(null);
  const error = clientError ?? state.error;

  // Form action yerine onSubmit kullanılır; böylece hata durumunda React
  // formu sıfırlamaz ve girilen içerik kaybolmaz.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // Sunucu gövde sınırına takılmadan önce büyük görseller burada reddedilir.
    const image = formData.get("image");
    if (image instanceof File && image.size > MAX_UPLOAD_BYTES) {
      setClientError(IMAGE_TOO_LARGE_MESSAGE);
      return;
    }
    setClientError(null);
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {children}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <SubmitButton className={styles.button} pending={pending}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
