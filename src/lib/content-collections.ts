import type { DocumentData } from "firebase-admin/firestore";
import { requiredText, optionalLines, FormError } from "./validation";
import { extractYoutubeId } from "./youtube";

export type ContentCollection = "services" | "articles" | "videos";

export interface ContentCollectionConfig {
  // Firestore koleksiyon adı.
  collection: ContentCollection;
  // Next cache etiketi; content.ts'teki `tags` değerleriyle aynı olmalı.
  cacheTag: ContentCollection;
  // Storage'da görsellerin tutulduğu klasör.
  folder: ContentCollection;
  // Belge bulunamadığında gösterilen Türkçe mesaj.
  notFound: string;
  // Kayıt sonrası yönlendirilen admin listesi.
  listPath: string;
  // Form alanlarını doğrular ve Firestore verisine çevirir.
  readFields: (formData: FormData) => DocumentData;
}

const serviceFields = (formData: FormData) => ({
  title: requiredText(formData, "title", 160),
  description: requiredText(formData, "description", 20_000),
});

const articleFields = (formData: FormData) => ({
  title: requiredText(formData, "title", 200),
  summary: requiredText(formData, "summary", 600),
  content: requiredText(formData, "content", 100_000),
  citations: optionalLines(formData, "citations", 20_000),
});

const videoFields = (formData: FormData) => {
  const title = requiredText(formData, "title", 200);
  const youtubeId = extractYoutubeId(requiredText(formData, "url", 500));
  if (!youtubeId) throw new FormError("Geçerli bir YouTube URL'si girin.");
  return { title, youtubeId };
};

export const serviceCollection: ContentCollectionConfig = {
  collection: "services",
  cacheTag: "services",
  folder: "services",
  notFound: "Hizmet bulunamadı.",
  listPath: "/admin/hizmetler",
  readFields: serviceFields,
};

export const articleCollection: ContentCollectionConfig = {
  collection: "articles",
  cacheTag: "articles",
  folder: "articles",
  notFound: "Makale bulunamadı.",
  listPath: "/admin/makaleler",
  readFields: articleFields,
};

export const videoCollection: ContentCollectionConfig = {
  collection: "videos",
  cacheTag: "videos",
  folder: "videos",
  notFound: "Video bulunamadı.",
  listPath: "/admin/videolar",
  readFields: videoFields,
};
