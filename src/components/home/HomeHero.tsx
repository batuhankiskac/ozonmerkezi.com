import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import buttonStyles from "@/styles/button.module.css";
import type { HomeHeroSection } from "./types";
import styles from "./HomeHero.module.css";

type HomeHeroProps = {
  section: HomeHeroSection;
  imageAlt: string;
  // site.json brand.doctorName ve brand.doctorTitle; yüzen kartta gösterilir.
  doctorName: string;
  doctorTitle?: string;
};

// Başlıkta vurgulanacak kelimeyi <em> içine alır; bulunamazsa düz metin döner.
function renderTitle(title: string, emphasis?: string) {
  const index = emphasis ? title.indexOf(emphasis) : -1;
  if (!emphasis || index === -1) return title;
  return (
    <>
      {title.slice(0, index)}
      <em>{emphasis}</em>
      {title.slice(index + emphasis.length)}
    </>
  );
}

// data-enter gecikmesi: sıra numarası CSS'te --i olarak okunur.
const enterDelay = (i: number) => ({ "--i": i }) as CSSProperties;

// Bölünmüş hero: solda metin, sağda çerçeveli portre ve yüzen hekim kartı.
export default function HomeHero({
  section,
  imageAlt,
  doctorName,
  doctorTitle,
}: HomeHeroProps) {
  const [primaryCta, secondaryCta] = section.ctas;

  return (
    <section className={styles.hero} id={section.id}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          {section.eyebrow ? (
            <p className={styles.eyebrow} data-enter="fade" style={enterDelay(0)}>
              {section.eyebrow}
            </p>
          ) : null}
          <h1 className={styles.title} data-enter style={enterDelay(1)}>
            {renderTitle(section.title, section.titleEmphasis)}
          </h1>
          <p className={styles.subtitle} data-enter style={enterDelay(2)}>
            {section.subtitle}
          </p>
          <div className={styles.actions} data-enter style={enterDelay(3)}>
            {primaryCta ? (
              <Link href={primaryCta.href} className={styles.primary}>
                {primaryCta.label}
                <ArrowIcon className={buttonStyles.icon} />
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link href={secondaryCta.href} className={styles.secondary}>
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>

        <div className={styles.media}>
          {/* Portre LCP öğesidir: preload ile erken istenir; çerçevede giriş
              animasyonu yoktur, LCP animasyonu beklemez. */}
          <div className={styles.frame}>
            <Image
              src="/images/doctor.jpg"
              alt={imageAlt}
              fill
              preload
              sizes="(max-width: 520px) 90vw, 448px"
              className={styles.image}
            />
          </div>
          <div className={styles.chip} data-enter="fade" style={enterDelay(4)}>
            <span className={styles.dot} aria-hidden="true" />
            <span>
              <span className={styles.chipName}>{doctorName}</span>
              {doctorTitle ? (
                <span className={styles.chipRole}>{doctorTitle}</span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
