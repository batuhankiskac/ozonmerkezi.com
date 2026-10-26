import Header from "@/components/Header";
import { ViewTransition } from "react";
import Footer from "@/components/Footer";
import MobileCtaBar from "@/components/MobileCtaBar";
import MotionObserver from "@/components/motion/MotionObserver";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import bioData from "@/data/bio.json";
import contactData from "@/data/contact.json";
import siteData from "@/data/site.json";
import { CONSENT_DEFAULT_SCRIPT } from "@/lib/consent";
import { SITE_URL } from "@/lib/site";
import styles from "./layout.module.css";

// Genel sayfalar ISR ile önceden üretilir ve en fazla 300 sn'de bir yenilenir.
// Admin'de yapılan değişiklikler updateTag ile geçersiz kılınır (bkz.
// src/lib/content.ts). Hostinger CDN `Vary: rsc` başlığını yok saydığı için
// RSC yanıtları next.config.ts içinde önbelleğe alınmaz; HTML yanıtları CDN'de
// s-maxage süresince tutulabilir.
export const revalidate = 300;

// Klinik kaydı: işletme adı, adres, telefon ve sosyal hesaplar site.json /
// contact.json dosyalarından gelir. Hekim, klinikte çalışan kişi olarak eklenir;
// sunulan hizmet medikal ozon tedavisidir.
const clinicSchema = {
  "@context": "https://schema.org",
  "@type": ["MedicalClinic", "MedicalBusiness"],
  name: siteData.brand.siteName,
  description: siteData.brand.shortDescription,
  url: SITE_URL,
  image: `${SITE_URL}/og.jpg`,
  telephone: contactData.tel,
  address: {
    "@type": "PostalAddress",
    ...contactData.addressParts,
  },
  openingHours: "Mo-Sa 09:00-18:00",
  availableService: {
    "@type": "MedicalTherapy",
    name: "Medikal ozon tedavisi",
  },
  employee: [
    {
      "@type": "Physician",
      name: bioData.name,
      url: SITE_URL,
      sameAs: ["https://profdrmuharremkiskac.com"],
    },
  ],
  sameAs: [contactData.social.instagram, contactData.social.youtube],
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Consent Mode varsayılanları etkileşimden önce, sunucu HTML'iyle gelir. */}
      <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      {/* Klavye kullanıcıları menüyü geçip doğrudan sayfa içeriğine gidebilir. */}
      <a href="#main-content" className={styles.skipLink}>
        İçeriğe atla
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
      />
      <Header />
      {/* Gezinmede sayfa içeriği yumuşak geçişle değişir (globals.css: .page). */}
      <ViewTransition default="page">{children}</ViewTransition>
      <Footer />
      <MobileCtaBar tel={contactData.tel} whatsapp={contactData.whatsapp} />
      <MotionObserver />
      <AnalyticsConsent />
    </>
  );
}
