import type { CSSProperties } from "react";
import type { HomeListSection } from "./types";
import SectionHeader from "./SectionHeader";
import styles from "./HomeRisks.module.css";

type HomeRisksProps = {
  section: HomeListSection;
};

// Daire içinde çarpı: "uygun değil" anlamı için dekoratif simge.
function CrossIcon() {
  return (
    <svg
      className={styles.cellIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

// Daire içinde bilgi simgesi: not kutusu için dekoratif simge.
function InfoIcon() {
  return (
    <svg
      className={styles.noteIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 11v5.25M12 7.75h.01" />
    </svg>
  );
}

export default function HomeRisks({ section }: HomeRisksProps) {
  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.container}>
        <SectionHeader
          index="05"
          eyebrow="Güvenlik"
          title={section.title}
          split
          intro={section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        />
        <ul className={styles.grid}>
          {section.items.map((item, index) => (
            <li
              key={item.title}
              className={styles.cell}
              data-reveal
              style={{ "--i": index % 4 } as CSSProperties}
            >
              <CrossIcon />
              <div>
                <h3 className={styles.cellTitle}>{item.title}</h3>
                {item.text ? (
                  <p className={styles.cellText}>{item.text}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        {section.note ? (
          <div className={styles.note} data-reveal="scale">
            <InfoIcon />
            <p>{section.note}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
