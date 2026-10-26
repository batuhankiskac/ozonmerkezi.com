import type { CSSProperties } from "react";
import type { HomeStepsSection } from "./types";
import SectionHeader from "./SectionHeader";
import styles from "./HomeSteps.module.css";

type HomeStepsProps = {
  section: HomeStepsSection;
};

// Tedavi süreci: numaralı adımlar; geniş ekranda tek satırda, üstte ince çizgi.
export default function HomeSteps({ section }: HomeStepsProps) {
  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.container}>
        <SectionHeader index="04" eyebrow="Süreç" title={section.title} />
        <ol className={styles.steps}>
          {section.items.map((item, index) => (
            <li
              key={item.title}
              className={styles.step}
              data-reveal
              style={{ "--i": index % 4 } as CSSProperties}
            >
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              {item.text ? <p className={styles.text}>{item.text}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
