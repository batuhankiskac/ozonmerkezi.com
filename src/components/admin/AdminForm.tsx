import Image from "next/image";
import type { FormState } from "@/app/admin/actions";
import AdminActionForm from "./AdminActionForm";
import styles from "./AdminForm.module.css";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

interface AdminFormProps {
  title: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel: string;
}

export function AdminForm({
  title,
  action,
  children,
  submitLabel,
}: AdminFormProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <AdminActionForm action={action} submitLabel={submitLabel}>
        {children}
      </AdminActionForm>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}

// Yardım metninin id'si; kontrolün aria-describedby değeri olarak kullanılır.
export function hintId(htmlFor: string) {
  return `${htmlFor}-hint`;
}

export function AdminFormField({
  label,
  htmlFor,
  hint,
  children,
}: FieldProps) {
  return (
    <div className={styles.group}>
      <label htmlFor={htmlFor}>{label}</label>
      {hint && (
        <p id={hintId(htmlFor)} className={styles.hint}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

interface ImageFieldProps {
  label: string;
  currentImageUrl?: string | null;
  currentImageAlt?: string;
  isEdit: boolean;
}

export function AdminImageField({
  label,
  currentImageUrl,
  currentImageAlt = "",
  isEdit,
}: ImageFieldProps) {
  return (
    <AdminFormField
      label={label}
      htmlFor="image"
      hint={
        isEdit
          ? "Yeni dosya seçmezseniz mevcut görsel korunur."
          : "JPEG, PNG, WebP veya AVIF; en fazla 5 MB. Görsel otomatik optimize edilir."
      }
    >
      {currentImageUrl && (
        <Image
          src={currentImageUrl}
          alt={currentImageAlt}
          width={240}
          height={160}
          className={styles.preview}
        />
      )}
      <input
        type="file"
        id="image"
        name="image"
        accept={IMAGE_ACCEPT}
        aria-describedby={hintId("image")}
        className={styles.fileInput}
      />
    </AdminFormField>
  );
}
