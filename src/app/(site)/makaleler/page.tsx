import { type CSSProperties, Suspense } from "react";
import ArticleCard from "@/components/ArticleCard";
import LoadingState from "@/components/LoadingState";
import PublicContentList from "@/components/PublicContentList";
import site from "@/data/site.json";
import { getArticles } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

const articlesIndex = site.seo.articlesIndex;

// data-enter gecikmesi: sıra numarası CSS'te --i olarak okunur.
const enterDelay = (i: number) => ({ "--i": i }) as CSSProperties;

export const metadata = pageMetadata({
  title: articlesIndex.title,
  description: articlesIndex.description,
  path: "/makaleler",
});

export default function ArticlesPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow} data-enter style={enterDelay(0)}>
          Yazılar
        </p>
        <h1 className={styles.title} data-enter style={enterDelay(1)}>
          Ozon Tedavisi Üzerine Yazılar
        </h1>
        <p className={styles.lead} data-enter style={enterDelay(2)}>
          {articlesIndex.description}
        </p>
      </header>
      <div className={styles.body}>
        <Suspense fallback={<LoadingState />}>
          <PublicContentList
            load={getArticles}
            emptyText="Henüz yayınlanmış bir içerik bulunmuyor."
            renderItem={(article, index) => (
              <ArticleCard article={article} index={index} />
            )}
          />
        </Suspense>
      </div>
    </main>
  );
}
