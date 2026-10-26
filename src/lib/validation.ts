// Sunucuya özel bağımlılığı olmayan saf yardımcılar; birim testleriyle doğrulanır.

// Kullanıcıya gösterilmesi güvenli hata mesajları.
export class FormError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormError";
  }
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const IMAGE_TOO_LARGE_MESSAGE =
  "Görsel boyutu 5 MB veya daha küçük olmalıdır.";
export const IMAGE_TYPE_MESSAGE =
  "Yalnız JPEG, PNG, WebP veya AVIF görseller yüklenebilir.";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const DOCUMENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

const FIELD_LABELS: Record<string, string> = {
  title: "Başlık",
  description: "Açıklama",
  summary: "Özet",
  content: "İçerik",
  url: "YouTube URL'si",
  citations: "Kaynakça",
};

export function isValidDocumentId(id: unknown): id is string {
  return typeof id === "string" && DOCUMENT_ID_PATTERN.test(id);
}

export function assertDocumentId(id: unknown): string {
  if (!isValidDocumentId(id)) throw new FormError("Geçersiz kayıt.");
  return id;
}

function fieldLabel(name: string): string {
  return FIELD_LABELS[name] ?? name;
}

// Sınır aşıldığında veri sessizce kesilmez; kullanıcıya düzeltmesi için hata döner.
function assertWithinLimit(name: string, value: string, maxLength: number) {
  if (value.length > maxLength) {
    throw new FormError(
      `${fieldLabel(name)} alanı en fazla ${maxLength} karakter olabilir.`,
    );
  }
}

export function requiredText(
  formData: FormData,
  name: string,
  maxLength: number,
): string {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) {
    throw new FormError(`${fieldLabel(name)} alanı zorunludur.`);
  }
  const trimmed = value.trim();
  assertWithinLimit(name, trimmed, maxLength);
  return trimmed;
}

// Önce satırlara ayrılır, sonra temizlenmiş satırların toplam uzunluğu sınanır.
export function optionalLines(
  formData: FormData,
  name: string,
  maxLength: number,
): string[] {
  const value = formData.get(name);
  if (typeof value !== "string") return [];
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  assertWithinLimit(name, lines.join("\n"), maxLength);
  return lines;
}

export function validateImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return IMAGE_TYPE_MESSAGE;
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) return IMAGE_TOO_LARGE_MESSAGE;
  return null;
}

export interface StorageObjectRef {
  bucket: string;
  path: string;
}

export function parseDownloadUrl(imageUrl: string): StorageObjectRef | null {
  try {
    const url = new URL(imageUrl);
    if (url.hostname !== "firebasestorage.googleapis.com") return null;
    const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
    if (!match) return null;
    return {
      bucket: decodeURIComponent(match[1]),
      path: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

export function parsePrivateKey(
  env: Record<string, string | undefined>,
): string | undefined {
  const base64 = env.FIREBASE_PRIVATE_KEY_BASE64?.trim();
  const raw = base64
    ? Buffer.from(base64, "base64").toString("utf8")
    : env.FIREBASE_PRIVATE_KEY;
  if (!raw) return undefined;
  // Tırnaklı ve kaçışlı (\n) biçimler gerçek satır sonlarına çevrilir.
  const key = raw
    .trim()
    .replace(/^(["'])([\s\S]*)\1$/, "$2")
    .replace(/\\n/g, "\n")
    .trim();
  return key || undefined;
}

export function isAdminToken(token: Record<string, unknown>): boolean {
  return token.admin === true;
}
