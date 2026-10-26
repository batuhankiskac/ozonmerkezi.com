import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  title: string;
  // Etiketteki sıra numarası, örn. "01".
  index?: string;
  eyebrow?: string;
  intro?: ReactNode;
  // Geniş ekranda başlık solda, açıklama sağda ve alta hizalı olur.
  split?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
};

// Bölüm başlığı: etiket (sıra + ad), h2 ve isteğe bağlı açıklama.
export default function SectionHeader({
  title,
  index,
  eyebrow,
  intro,
  split = false,
  headingLevel: Heading = "h2",
  className,
}: SectionHeaderProps) {
  return (
    <header
      data-reveal
      className={[styles.header, split ? styles.split : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.main}>
        {index || eyebrow ? (
          <p className={styles.eyebrow}>
            {index ? <span className={styles.index}>{index}</span> : null}
            {eyebrow ? <span>{eyebrow}</span> : null}
          </p>
        ) : null}
        <Heading className={styles.title}>{title}</Heading>
      </div>
      {intro ? <div className={styles.intro}>{intro}</div> : null}
    </header>
  );
}
