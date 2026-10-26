import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import ArticleFields from "@/components/admin/ArticleFields";
import { getArticle } from "@/lib/content";
import { updateArticle } from "../../../actions";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  return (
    <AdminForm
      title="Makaleyi Düzenle"
      action={updateArticle.bind(null, id)}
      submitLabel="Güncelle"
    >
      <ArticleFields article={article} />
    </AdminForm>
  );
}
