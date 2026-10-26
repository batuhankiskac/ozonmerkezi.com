import { pageMetadata } from "@/lib/metadata";
import siteData from "@/data/site.json";
import HomeAbout from "@/components/home/HomeAbout";
import HomeBenefits from "@/components/home/HomeBenefits";
import HomeContact from "@/components/home/HomeContact";
import HomeHero from "@/components/home/HomeHero";
import HomeRisks from "@/components/home/HomeRisks";
import HomeSteps from "@/components/home/HomeSteps";
import HomeUses from "@/components/home/HomeUses";
import type { HomeSection } from "@/components/home/types";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: siteData.seo.home.title,
  description: siteData.seo.home.description,
  path: "/",
  image: "/og.jpg",
});

const sections = siteData.home.sections as HomeSection[];

// Bölümler id ile bulunur; tür kontrolü kind ile yapılır.
function getSection<K extends HomeSection["kind"]>(id: string, kind: K) {
  const section = sections.find((item) => item.id === id);
  return section?.kind === kind
    ? (section as Extract<HomeSection, { kind: K }>)
    : undefined;
}

const heroImageAlt =
  siteData.images.find((image) => image.usedIn === "hero")?.alt ?? "";

export default function Home() {
  const hero = getSection("hero", "hero");
  const about = getSection("nedir", "text");
  const science = getSection("bilimsel-yaklasim", "text");
  const methods = getSection("yontemler", "cards");
  const uses = getSection("kullanim-alanlari", "list");
  const steps = getSection("surec", "steps");
  const risks = getSection("dikkat", "list");
  const contact = getSection("iletisim", "contact");

  return (
    <main id="main-content" className={styles.main}>
      {hero ? (
        <HomeHero
          section={hero}
          imageAlt={heroImageAlt}
          doctorName={siteData.brand.doctorName}
          doctorTitle={siteData.brand.doctorTitle}
        />
      ) : null}
      {about ? <HomeAbout section={about} reason={science} /> : null}
      {methods ? <HomeBenefits section={methods} /> : null}
      {uses ? <HomeUses section={uses} /> : null}
      {steps ? <HomeSteps section={steps} /> : null}
      {risks ? <HomeRisks section={risks} /> : null}
      {contact ? (
        <HomeContact
          section={contact}
          mapEmbedUrl={siteData.contact.mapEmbedUrl}
        />
      ) : null}
    </main>
  );
}
