import { AdminForm } from "@/components/admin/AdminForm";
import ArticleFields from "@/components/admin/ArticleFields";
import { createArticle } from "../../actions";

export default function AddArticlePage() {
  return (
    <AdminForm
      title="Yeni Makale Ekle"
      action={createArticle}
      submitLabel="Kaydet"
    >
      <ArticleFields />
    </AdminForm>
  );
}
