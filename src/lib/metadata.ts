import type { Metadata } from "next";
import site from "@/data/site.json";

export const SITE_NAME = site.brand.siteName;

const FALLBACK_IMAGE = { url: "/og.jpg", width: 1200, height: 630 };

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

// Next.js metadata birleştirmesi yüzeyseldir: openGraph/twitter nesnesi
// tanımlayan sayfa üst düzeydeki alanları tamamen ezer. Bu yüzden her sayfa
// için eksiksiz openGraph ve twitter nesnesi üretilir.
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  // Site adını zaten içeren başlıklar (ana sayfa) şablonsuz kullanılır.
  const hasSiteName = title.includes(SITE_NAME);
  const fullTitle = hasSiteName ? title : `${title} | ${SITE_NAME}`;
  const images = image ? [{ url: image }] : [FALLBACK_IMAGE];

  const common = {
    locale: "tr_TR",
    siteName: SITE_NAME,
    title: fullTitle,
    description,
    url: path,
    images,
  };

  return {
    title: hasSiteName ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph:
      type === "article"
        ? {
            ...common,
            type: "article",
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : { ...common, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((item) => item.url),
    },
  };
}
