import type { CSSProperties } from "react";
import ExternalLink from "@/components/ExternalLink";
import MapEmbed from "@/components/MapEmbed";
import SectionHeader from "./SectionHeader";
import type { HomeContactSection } from "./types";
import styles from "./HomeContact.module.css";

type HomeContactProps = {
  section: HomeContactSection;
  mapEmbedUrl: string;
};

// Sosyal medya ikonları (dekoratif; etiket metni yanında yer alır).
function SocialIcon({ network }: { network: string }) {
  if (network === "instagram") {
    return (
      <svg
        className={styles.socialIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (network === "youtube") {
    return (
      <svg
        className={styles.socialIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
      </svg>
    );
  }
  return null;
}

export default function HomeContact({
  section,
  mapEmbedUrl,
}: HomeContactProps) {
  // Telefon bağlantısı büyük gösterilir; diğer kayıtlar etiket/değer satırıdır.
  const phone = section.items.find((item) => item.href?.startsWith("tel:"));
  const rows = section.items.filter((item) => item !== phone);

  return (
    <section id={section.id} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.info}>
            <SectionHeader
              index="06"
              eyebrow="İletişim"
              title={section.title}
              intro={section.subtitle ? <p>{section.subtitle}</p> : undefined}
            />

            {phone ? (
              <div className={styles.phoneBlock} data-reveal>
                <p className={styles.label}>{phone.title}</p>
                <a href={phone.href} className={styles.phone}>
                  {phone.text}
                </a>
              </div>
            ) : null}

            {rows.map((item, index) => (
              <div
                key={item.title}
                className={styles.row}
                data-reveal
                style={{ "--i": index } as CSSProperties}
              >
                <p className={styles.label}>{item.title}</p>
                {item.href ? (
                  <a href={item.href} className={styles.value}>
                    {item.text}
                  </a>
                ) : (
                  <p className={styles.value}>{item.text}</p>
                )}
              </div>
            ))}

            <div className={styles.row} data-reveal>
              <p className={styles.label}>Sosyal medya</p>
              <div className={styles.socials}>
                {section.social.map((link) => (
                  <ExternalLink
                    key={link.href}
                    href={link.href}
                    className={styles.social}
                  >
                    <SocialIcon network={link.label.toLowerCase()} />
                    <span>{link.label}</span>
                  </ExternalLink>
                ))}
              </div>
            </div>
          </div>

          {/* Harita yalnızca kullanıcı isteğiyle yüklenir (MapEmbed). */}
          <div className={styles.map} data-reveal="mask">
            <MapEmbed
              embedUrl={mapEmbedUrl}
              title="Ozon Merkezi konum haritası"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
