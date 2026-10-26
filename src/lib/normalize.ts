// Firestore belgelerini uygulama tiplerine çeviren saf fonksiyonlar.
// server-only içermez; birim testlerinde doğrudan kullanılabilir.
import type {
  Article,
  ArticleSummary,
  Service,
  Video,
} from "@/types/content";

export type RawDocument = Record<string, unknown>;

export function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function optionalText(value: unknown): string | null {
  const result = text(value).trim();
  return result ? result : null;
}

function validIso(date: unknown): string | null {
  return date instanceof Date && !Number.isNaN(date.getTime())
    ? date.toISOString()
    : null;
}

export function isoDate(value: unknown): string | null {
  if (value instanceof Date) return validIso(value);
  if (value && typeof value === "object") {
    if ("toDate" in value && typeof value.toDate === "function") {
      try {
        return validIso(value.toDate());
      } catch {
        return null;
      }
    }
    // Serileştirilmiş Timestamp: { seconds, nanoseconds }
    if ("seconds" in value && typeof value.seconds === "number") {
      return validIso(new Date(value.seconds * 1000));
    }
  }
  if (typeof value === "string" && value.trim()) {
    return validIso(new Date(value));
  }
  return null;
}

// Eski belgelerde görsel alanı `image` adıyla tutuluyordu.
export function imageUrl(data: RawDocument): string | null {
  return optionalText(data.imageUrl) ?? optionalText(data.image);
}

export function toArticleSummary(
  id: string,
  data: RawDocument,
): ArticleSummary {
  return {
    id,
    title: text(data.title),
    summary: text(data.summary),
    imageUrl: imageUrl(data),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
  };
}

export function toArticle(id: string, data: RawDocument): Article {
  return {
    ...toArticleSummary(id, data),
    content: text(data.content),
    citations: Array.isArray(data.citations)
      ? data.citations.filter(
          (item): item is string =>
            typeof item === "string" && item.trim() !== "",
        )
      : [],
  };
}

export function toService(id: string, data: RawDocument): Service {
  return {
    id,
    title: text(data.title),
    description: text(data.description),
    imageUrl: imageUrl(data),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
  };
}

// YouTube video kimlikleri tam olarak 11 karakterdir; bu desene uymayan
// kayıt iframe'e girmeden atlanır.
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

// Geçersiz YouTube kimliği olan video kaydı null döner ve listelenmez.
export function toVideo(id: string, data: RawDocument): Video | null {
  const youtubeId = text(data.youtubeId);
  if (!YOUTUBE_ID_PATTERN.test(youtubeId)) return null;
  return {
    id,
    title: text(data.title),
    youtubeId,
    imageUrl: imageUrl(data),
    createdAt: isoDate(data.createdAt),
    updatedAt: isoDate(data.updatedAt),
  };
}

// Tarihi olmayan kayıtlar sona düşer; girdi dizisi değiştirilmez.
export function newestFirst<T extends { createdAt: string | null }>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
}
