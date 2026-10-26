import type { Article } from "@/types/content";
import { AdminFormField, AdminImageField, hintId } from "./AdminForm";
import styles from "./AdminForm.module.css";

export default function ArticleFields({ article }: { article?: Article }) {
  return (
    <>
      <AdminFormField label="Başlık" htmlFor="title">
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={article?.title}
          maxLength={200}
          required
          className={styles.input}
        />
      </AdminFormField>
      <AdminFormField
        label="Özet"
        htmlFor="summary"
        hint="Listeleme ve arama sonuçlarında kullanılır."
      >
        <textarea
          id="summary"
          name="summary"
          rows={3}
          defaultValue={article?.summary}
          maxLength={600}
          required
          aria-describedby={hintId("summary")}
          className={styles.textarea}
        />
      </AdminFormField>
      <AdminImageField
        label="Kapak görseli"
        isEdit={Boolean(article)}
        currentImageUrl={article?.imageUrl}
        currentImageAlt={article ? `${article.title} mevcut kapak görseli` : ""}
      />
      <AdminFormField label="İçerik (Markdown)" htmlFor="content">
        <textarea
          id="content"
          name="content"
          rows={20}
          defaultValue={article?.content}
          required
          className={styles.textarea}
        />
      </AdminFormField>
      <AdminFormField
        label="Kaynakça"
        htmlFor="citations"
        hint="Her satıra bir kaynak yazın."
      >
        <textarea
          id="citations"
          name="citations"
          rows={6}
          defaultValue={article?.citations.join("\n")}
          aria-describedby={hintId("citations")}
          className={styles.textarea}
        />
      </AdminFormField>
    </>
  );
}
