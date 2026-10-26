import type { CSSProperties } from "react";
import ContactActions from "@/components/ContactActions";
import ExternalLink from "@/components/ExternalLink";
import MapEmbed from "@/components/MapEmbed";
import contactData from "@/data/contact.json";
import site from "@/data/site.json";
import { pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

// data-enter ve data-reveal gecikmeleri: sıra numarası CSS'te --i olarak okunur.
const enterDelay = (i: number) => ({ "--i": i }) as CSSProperties;
const revealDelay = (i: number) => ({ "--i": i % 4 }) as CSSProperties;

export const metadata = pageMetadata({
  title: site.seo.contact.title,
  description: site.seo.contact.description,
  path: "/iletisim",
});

export default function ContactPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow} data-enter style={enterDelay(0)}>
          İletişim
        </p>
        <h1 className={styles.title} data-enter style={enterDelay(1)}>
          İletişim &amp; Randevu
        </h1>
        <p className={styles.lead} data-enter style={enterDelay(2)}>
          {site.seo.contact.description}
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.layout}>
          <div className={styles.info}>
            <section
              className={styles.row}
              data-reveal
              style={revealDelay(0)}
            >
              <h2 className={styles.label}>Telefon</h2>
              <a className={styles.phone} href={`tel:${contactData.tel}`}>
                {contactData.phone}
              </a>
              <div className={styles.actions}>
                <ContactActions />
              </div>
            </section>

            <section
              className={styles.row}
              data-reveal
              style={revealDelay(1)}
            >
              <h2 className={styles.label}>Adres</h2>
              <address className={styles.value}>{contactData.address}</address>
              <ExternalLink className={styles.link} href={contactData.mapsLink}>
                Google Haritalar&apos;da aç
              </ExternalLink>
            </section>

            <section
              className={styles.row}
              data-reveal
              style={revealDelay(2)}
            >
              <h2 className={styles.label}>Çalışma Saatleri</h2>
              <p className={styles.value}>{contactData.workingHours}</p>
            </section>

            <section
              className={styles.row}
              data-reveal
              style={revealDelay(3)}
            >
              <h2 className={styles.label}>Sosyal Medya</h2>
              <div className={styles.social}>
                <ExternalLink
                  className={styles.link}
                  href={contactData.social.instagram}
                >
                  Instagram
                </ExternalLink>
                <ExternalLink
                  className={styles.link}
                  href={contactData.social.youtube}
                >
                  YouTube
                </ExternalLink>
              </div>
            </section>
          </div>

          <div className={styles.mapWrap} data-reveal="mask">
            <MapEmbed
              embedUrl={contactData.mapEmbedUrl}
              title={`${site.brand.siteName} konumu`}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
