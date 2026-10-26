// URL sonundaki noktalama işaretleri bağlantıya dahil edilmez.
const URL_PATTERN = /(https?:\/\/[^\s]*[^\s.,;:!?)\]}'"])/g;

export const EXTERNAL_LINK = /^https?:\/\//i;

// Markdown görselleri yalnız Firebase Storage barındırmasından kabul edilir.
// Not: Silme tarafındaki `parseDownloadUrl` (validation.ts) bilinçli olarak
// yalnız `firebasestorage.googleapis.com` kabul eder. Uygulama görselleri bu
// host'la üretir (uploads.ts) ve silme yalnız bu URL biçimini çözer. Buradaki
// liste ise markdown içine elle yazılmış görselleri yalnız gösterir, silmez;
// bu yüzden `storage.googleapis.com` de kabul edilir. İki liste birleştirilmemeli.
export const ALLOWED_IMAGE_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
]);

export function allowedImageSrc(src: string | undefined): string | null {
  if (!src) return null;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(url.hostname)
      ? src
      : null;
  } catch {
    return null;
  }
}

export function citationParts(value: string): string[] {
  return value.split(URL_PATTERN).filter(Boolean);
}
