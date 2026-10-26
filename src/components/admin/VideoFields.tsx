import { AdminFormField } from "./AdminForm";
import styles from "./AdminForm.module.css";

export default function VideoFields() {
  return (
    <>
      <AdminFormField label="Başlık" htmlFor="title">
        <input
          type="text"
          id="title"
          name="title"
          maxLength={200}
          required
          className={styles.input}
        />
      </AdminFormField>
      <AdminFormField label="YouTube URL'si" htmlFor="url">
        <input
          type="url"
          id="url"
          name="url"
          placeholder="https://www.youtube.com/watch?v=..."
          required
          className={styles.input}
        />
      </AdminFormField>
    </>
  );
}
