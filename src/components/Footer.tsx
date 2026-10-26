import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import ConsentPreferencesButton from "./ConsentPreferencesButton";
import ContactActions from "./ContactActions";
import ExternalLink from "./ExternalLink";
import buttonStyles from "@/styles/button.module.css";
import site from "@/data/site.json";
import { privacyLink } from "@/data/navigation";
import styles from "./Footer.module.css";

const EXTERNAL_LINK = /^https?:\/\//i;

// Yıl, sunucunun saat diliminden bağımsız olarak İstanbul'a göre hesaplanır.
function currentYear() {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date());
}

export default function Footer() {
  // site.json'daki telif metni sabit yıl içerir; yıl her yıl güncellenir.
  const copyright = site.footer.text.replace(/©\s*\d{4}/, `© ${currentYear()}`);
  const internalLinks = site.footer.links.filter(
    (link) => !EXTERNAL_LINK.test(link.href),
  );
  const externalLinks = site.footer.links.filter((link) =>
    EXTERNAL_LINK.test(link.href),
  );

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.cta}>
          <div>
            <p className={styles.eyebrow}>İletişim</p>
            <p className={styles.ctaTitle}>
              Sağlığınız için ilk adımı atın.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <div className={styles.contacts}>
              <ContactActions inverted />
            </div>
            <Link href="/iletisim" prefetch={false} className={styles.ctaButton}>
              Randevu Al
              <ArrowIcon className={buttonStyles.icon} />
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.column}>
            <p className={styles.brandName}>{site.brand.doctorName}</p>
            <p className={styles.brandText}>{site.brand.shortDescription}</p>
          </div>

          <div className={styles.column}>
            <h2 className={styles.title}>Sayfalar</h2>
            <nav aria-label="Alt menü">
              <ul className={styles.list}>
                {internalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} prefetch={false}>
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={privacyLink.href} prefetch={false}>
                    {privacyLink.label}
                  </Link>
                </li>
                <li>
                  <ConsentPreferencesButton />
                </li>
              </ul>
            </nav>
          </div>

          <div className={styles.column}>
            <h2 className={styles.title}>Bağlantılar</h2>
            <ul className={styles.list}>
              {externalLinks.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href}>{link.label}</ExternalLink>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h2 className={styles.title}>Adres</h2>
            <address className={styles.address}>{site.contact.address}</address>
            <p className={styles.hours}>{site.contact.workingHours}</p>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>{copyright}</p>
          <a href="#main-content" className={styles.toTop}>
            Yukarı dön
            {/* Ok, ArrowIcon'un sağ-yukarı yönüne ek -45° ile yukarı bakar. */}
            <span className={styles.toTopIcon}>
              <ArrowIcon direction="up-right" className={buttonStyles.icon} />
            </span>
          </a>
        </div>
      </div>

      {/* Dekoratif dev marka yazısı; ekran okuyucudan gizli, kenarda kırpılır. */}
      <p className={styles.wordmark} aria-hidden="true">
        {site.brand.siteName}
      </p>
    </footer>
  );
}
