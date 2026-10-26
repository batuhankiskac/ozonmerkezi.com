import AdminContentList from "@/components/admin/AdminContentList";
import { getArticles } from "@/lib/content";
import { deleteArticle } from "../actions";

export default async function ArticlesAdminPage() {
  const articles = await getArticles();
  return (
    <AdminContentList
      title="Makaleler"
      addHref="/admin/makaleler/ekle"
      addLabel="Yeni Makale Ekle"
      emptyText="Henüz eklenmiş bir makale yok."
      deleteAction={deleteArticle}
      items={articles.map((article) => ({
        id: article.id,
        title: article.title,
        description: article.summary,
        imageUrl: article.imageUrl,
        editHref: `/admin/makaleler/duzenle/${article.id}`,
      }))}
    />
  );
}
