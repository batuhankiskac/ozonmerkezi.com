"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import styles from "./AdminContentList.module.css";

interface DeleteContentFormProps {
  id: string;
  deleteAction: (id: string) => Promise<FormState>;
}

// Silme sunucu hatası dönerse mesaj bu kayıt satırında gösterilir.
export default function DeleteContentForm({
  id,
  deleteAction,
}: DeleteContentFormProps) {
  const [state, formAction] = useActionState<FormState, FormData>(
    async () => deleteAction(id),
    {},
  );

  return (
    <form action={formAction} className={styles.deleteForm}>
      <SubmitButton
        className={styles.deleteButton}
        pendingText="Siliniyor..."
        confirmMessage="Bu içeriği kalıcı olarak silmek istediğinize emin misiniz?"
      >
        Sil
      </SubmitButton>
      {state.error && (
        <p className={styles.deleteError} role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
