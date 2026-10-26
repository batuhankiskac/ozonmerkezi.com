import Link from "next/link";
import type { CSSProperties } from "react";
import ArrowIcon from "@/components/ArrowIcon";
import { formatDate } from "@/lib/format";
import buttonStyles from "@/styles/button.module.css";
import type { ArticleSummary } from "@/types/content";
import CardMedia from "./CardMedia";
import styles from "./ArticleCard.module.css";

type ArticleCardProps = {
  article: ArticleSummary;
  // Izgaradaki sıra; açılış gecikmesi için (--i = index % 3).
  index?: number;
};

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {

  return (
    <article
      className={styles.card}
      data-reveal
      style={{ "--i": index % 3 } as CSSProperties}
    >
      <Link
        href={`/makaleler/${article.id}`}
        className={styles.anchor}
        aria-label={`${article.title} makalesini oku`}
      >
        {article.imageUrl ? (
          <CardMedia className={styles.media} src={article.imageUrl} />
        ) : null}
        <div
          className={
            article.imageUrl ? styles.content : `${styles.content} ${styles.textOnly}`
          }
        >
          {article.createdAt && (
            <time className={styles.date} dateTime={article.createdAt}>
              {formatDate(article.createdAt)}
            </time>
          )}
          <h2 className={styles.title}>{article.title}</h2>
          <p className={styles.summary}>{article.summary}</p>
          <span className={styles.readMore}>
            Devamını Oku
            <ArrowIcon className={buttonStyles.icon} />
          </span>
        </div>
      </Link>
    </article>
  );
}
