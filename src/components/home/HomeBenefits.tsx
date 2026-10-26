import type { CSSProperties } from "react";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import buttonStyles from "@/styles/button.module.css";
import type { HomeCardsSection, HomeItem } from "./types";
import SectionHeader from "./SectionHeader";
import styles from "./HomeBenefits.module.css";

type HomeBenefitsProps = {
  section: HomeCardsSection;
  index?: string;
  eyebrow?: string;
};

// Veride bağlantı etiketinin sonunda ok karakteri olabilir; ok SVG ile çizilir.
function cleanLinkLabel(label = "Detayları Okuyun") {
  return label.replace(/\s*→\s*$/, "");
}

function CardBody({ item, index }: { item: HomeItem; index: number }) {
  return (
    <>
      <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
      <h3 className={styles.cardTitle}>{item.title}</h3>
      {item.text ? <p className={styles.cardText}>{item.text}</p> : null}
    </>
  );
}

// Kart ızgarası. href'i olan kart bağlantı olur ve hover'da dolar; olmayan
// kart düz bilgi kartı olarak kalır.
export default function HomeBenefits({
  section,
  index = "02",
  eyebrow = "Yöntemler",
}: HomeBenefitsProps) {
  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.container}>
        <SectionHeader
          index={index}
          eyebrow={eyebrow}
          title={section.title}
          split
          intro={section.subtitle ? <p>{section.subtitle}</p> : undefined}
        />
        <ul className={styles.grid}>
          {section.items.map((item, itemIndex) => (
            <li
              key={item.title}
              className={styles.item}
              data-reveal
              style={{ "--i": itemIndex % 4 } as CSSProperties}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className={`${styles.card} ${styles.cardLinked}`}
                >
                  <CardBody item={item} index={itemIndex} />
                  {/* Her bağlantının adı kart başlığını da içerir (ekran okuyucu için). */}
                  <span className={styles.cardLink}>
                    {cleanLinkLabel(item.linkLabel)}
                    <ArrowIcon
                      className={`${buttonStyles.icon} ${styles.arrow}`}
                    />
                    <span className="sr-only"> ({item.title})</span>
                  </span>
                </Link>
              ) : (
                <div className={styles.card}>
                  <CardBody item={item} index={itemIndex} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
