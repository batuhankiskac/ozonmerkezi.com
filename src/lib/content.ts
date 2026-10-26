import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Firestore } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";
import {
  newestFirst,
  toArticle,
  toArticleSummary,
  toService,
  toVideo,
  type RawDocument,
} from "./normalize";
import type {
  Article,
  ArticleSummary,
  Service,
  Video,
} from "@/types/content";

// Route ve veri önbelleği bu süreyle yenilenir. updateTag etiket kaydını süreç
// içi bellekte tutar; birden fazla worker çalışıyorsa diğerleri en geç bu süre
// sonunda güncel veriyi görür.
const REVALIDATE_SECONDS = 300;
const FIRESTORE_TIMEOUT_MS = 8000;

class MissingFirebaseConfigError extends Error {
  constructor() {
    super("Firebase Admin yapılandırması eksik.");
    this.name = "MissingFirebaseConfigError";
  }
}

function isMissingFirebaseConfig(error: unknown): boolean {
  return error instanceof Error && error.name === "MissingFirebaseConfigError";
}

// unstable_cache fırlatılan hataları önbelleğe almaz; böylece yapılandırma
// eksikken (ör. build ortamı) boş içerik önbelleğe yazılmaz.
function requireDb(): Firestore {
  const db = getAdminDb();
  if (!db) throw new MissingFirebaseConfigError();
  return db;
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Firestore isteği zaman aşımına uğradı: ${label}`)),
      FIRESTORE_TIMEOUT_MS,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

let warnedMissingConfig = false;

async function orFallback<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    const missingConfig = isMissingFirebaseConfig(error);
    // Build sırasında Firestore hatası build'i düşürmesin; sayfa boş listeyle
    // üretilir ve ISR en fazla REVALIDATE_SECONDS sonra yeniden üretir.
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
    if (!missingConfig && !isBuildPhase) throw error;
    if (!missingConfig) {
      console.error(
        "Build sırasında içerik okunamadı; boş liste kullanılıyor.",
        error,
      );
      return fallback;
    }
    if (!warnedMissingConfig) {
      console.warn(
        "Firebase yapılandırması eksik; içerik önbelleğe alınmadan boş döndürülüyor.",
      );
      warnedMissingConfig = true;
    }
    return fallback;
  }
}

// normalize null dönerse belge listeye alınmaz (ör. geçersiz YouTube kimliği).
async function readCollection<T>(
  collectionName: string,
  normalize: (id: string, data: RawDocument) => T | null,
  fields?: string[],
): Promise<T[]> {
  const collection = requireDb().collection(collectionName);
  const query = fields ? collection.select(...fields) : collection;
  const snapshot = await withTimeout(query.get(), collectionName);
  return snapshot.docs
    .map((document) => normalize(document.id, document.data()))
    .filter((item): item is T => item !== null);
}

const cachedArticles = unstable_cache(
  async () =>
    newestFirst(
      await readCollection("articles", toArticleSummary, [
        "title",
        "summary",
        "imageUrl",
        "image",
        "createdAt",
        "updatedAt",
      ]),
    ),
  ["articles"],
  { revalidate: REVALIDATE_SECONDS, tags: ["articles"] },
);

const cachedServices = unstable_cache(
  async () => newestFirst(await readCollection("services", toService)),
  ["services"],
  { revalidate: REVALIDATE_SECONDS, tags: ["services"] },
);

const cachedVideos = unstable_cache(
  async () => newestFirst(await readCollection("videos", toVideo)),
  ["videos"],
  { revalidate: REVALIDATE_SECONDS, tags: ["videos"] },
);

const cachedArticleById = (id: string) =>
  unstable_cache(
    async () => {
      const document = await withTimeout(
        requireDb().collection("articles").doc(id).get(),
        `articles/${id}`,
      );
      const data = document.data();
      return data ? toArticle(document.id, data) : null;
    },
    ["article", id],
    { revalidate: REVALIDATE_SECONDS, tags: ["articles"] },
  )();

// React cache(): generateMetadata ve sayfa aynı istekte tek okuma paylaşır.
export const getArticles = cache(
  (): Promise<ArticleSummary[]> => orFallback(cachedArticles, []),
);

export const getServices = cache(
  (): Promise<Service[]> => orFallback(cachedServices, []),
);

export const getVideos = cache(
  (): Promise<Video[]> => orFallback(cachedVideos, []),
);

// Yalnız listede bulunan id'ler sorgulanır; rastgele id'ler önbellek kaydı
// oluşturmaz ve "/" içeren id'ler doc() çağrısına ulaşmaz.
export const getArticle = cache(
  async (id: string): Promise<Article | null> => {
    const articles = await getArticles();
    if (!articles.some((article) => article.id === id)) return null;
    return orFallback(() => cachedArticleById(id), null);
  },
);

export const getService = cache(
  async (id: string): Promise<Service | null> => {
    const services = await getServices();
    return services.find((service) => service.id === id) ?? null;
  },
);
