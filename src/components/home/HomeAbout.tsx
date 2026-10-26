import type { CSSProperties } from "react";
import type { HomeTextSection } from "./types";
import SectionHeader from "./SectionHeader";
import styles from "./HomeAbout.module.css";

type HomeAboutProps = {
  section: HomeTextSection;
  // Sağ sütunun altındaki vurgulu not kutusu (ör. "Bilimsel yaklaşım").
  reason?: HomeTextSection;
};

// Onaylı daire: dekoratif ince çizgi simgesi.
function CheckIcon() {
  return (
    <svg
      className={styles.checkIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M8.25 12.25l2.5 2.5 5-5.25" />
    </svg>
  );
}

export default function HomeAbout({ section, reason }: HomeAboutProps) {
  const [lead, ...rest] = section.paragraphs;

  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <SectionHeader
            index="01"
            eyebrow="Ozon Tedavisi"
            title={section.title}
            className={styles.sticky}
          />
          <div className={styles.body}>
            {lead ? (
              <p
                className={styles.lead}
                data-reveal
                style={{ "--i": 0 } as CSSProperties}
              >
                {lead}
              </p>
            ) : null}
            {rest.map((paragraph, index) => (
              <p
                key={paragraph}
                className={styles.paragraph}
                data-reveal
                style={{ "--i": (index + 1) % 4 } as CSSProperties}
              >
                {paragraph}
              </p>
            ))}
            {section.items?.length ? (
              <ul className={styles.checklist}>
                {section.items.map((item, index) => (
                  <li
                    key={item.title}
                    className={styles.checkItem}
                    data-reveal
                    style={{ "--i": index % 4 } as CSSProperties}
                  >
                    <CheckIcon />
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {reason ? (
              <aside id={reason.id} className={styles.note} data-reveal="scale">
                <h3 className={styles.noteTitle}>{reason.title}</h3>
                {reason.paragraphs.map((paragraph) => (
                  <p key={paragraph} className={styles.noteText}>
                    {paragraph}
                  </p>
                ))}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
