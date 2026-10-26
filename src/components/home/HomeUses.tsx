import type { CSSProperties } from "react";
import type { HomeListSection } from "./types";
import SectionHeader from "./SectionHeader";
import styles from "./HomeUses.module.css";

type HomeUsesProps = {
  section: HomeListSection;
};

// İnce artı simgesi: "destekleyici" anlamında dekoratif işaret.
function PlusIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

// Kullanım alanları: başlık + açıklama, altında ince çizgili iki/üç sütunlu liste.
export default function HomeUses({ section }: HomeUsesProps) {
  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.container}>
        <SectionHeader
          index="03"
          eyebrow="Kullanım Alanları"
          title={section.title}
          split
          intro={section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        />
        <ul className={styles.list}>
          {section.items.map((item, index) => (
            <li
              key={item.title}
              className={styles.item}
              data-reveal
              style={{ "--i": index % 3 } as CSSProperties}
            >
              <PlusIcon />
              <div>
                <h3 className={styles.title}>{item.title}</h3>
                {item.text ? <p className={styles.text}>{item.text}</p> : null}
              </div>
            </li>
          ))}
        </ul>
        {section.note ? <p className={styles.note}>{section.note}</p> : null}
      </div>
    </section>
  );
}
