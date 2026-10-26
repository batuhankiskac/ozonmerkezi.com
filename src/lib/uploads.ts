import "server-only";

import { randomUUID } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { getAdminStorage } from "./firebase-admin";
import {
  FormError,
  IMAGE_TYPE_MESSAGE,
  parseDownloadUrl,
  validateImageFile,
} from "./validation";

const MAX_INPUT_PIXELS = 40_000_000;
// AVIF dosyaları sharp tarafından "heif" olarak raporlanır.
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "heif"]);
const UNREADABLE_IMAGE_MESSAGE =
  "Görsel okunamadı. Lütfen farklı bir dosya deneyin.";

export interface UploadedImage {
  imageUrl: string;
  imagePath: string;
}

async function processImage(source: Buffer): Promise<Buffer> {
  const image = sharp(source, { limitInputPixels: MAX_INPUT_PIXELS });
  const metadata = await image.metadata().catch(() => {
    throw new FormError(UNREADABLE_IMAGE_MESSAGE);
  });
  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    throw new FormError(IMAGE_TYPE_MESSAGE);
  }
  if (
    metadata.width &&
    metadata.height &&
    metadata.width * metadata.height > MAX_INPUT_PIXELS
  ) {
    throw new FormError("Görsel çözünürlüğü çok yüksek.");
  }

  try {
    return await image
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new FormError(UNREADABLE_IMAGE_MESSAGE);
  }
}

export async function uploadImage(
  file: File,
  folder: string,
): Promise<UploadedImage> {
  const invalid = validateImageFile(file);
  if (invalid) throw new FormError(invalid);

  const storage = getAdminStorage();
  if (!storage) {
    throw new Error("Firebase Storage sunucu yapılandırması eksik.");
  }

  const source = Buffer.from(await file.arrayBuffer());
  const processed = await processImage(source);

  const safeBaseName =
    path
      .basename(file.name, path.extname(file.name))
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "gorsel";
  const token = randomUUID();
  const imagePath = `${folder}/${Date.now()}-${safeBaseName}-${token}.webp`;
  const bucket = storage.bucket();

  await bucket.file(imagePath).save(processed, {
    resumable: false,
    contentType: "image/webp",
    metadata: {
      cacheControl: "public,max-age=31536000,immutable",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const imageUrl =
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
    `${encodeURIComponent(imagePath)}?alt=media&token=${token}`;
  return { imageUrl, imagePath };
}

export async function deleteImage(
  imageUrl: string | null,
  imagePath?: string | null,
): Promise<void> {
  const storage = getAdminStorage();
  if (!storage) return;
  const bucket = storage.bucket();

  let targetPath = imagePath || null;
  if (!targetPath && imageUrl) {
    // Yalnız projenin kendi bucket'ındaki dosyalar silinir.
    const ref = parseDownloadUrl(imageUrl);
    if (ref && ref.bucket === bucket.name) targetPath = ref.path;
  }
  if (!targetPath) return;

  try {
    await bucket.file(targetPath).delete({ ignoreNotFound: true });
  } catch (error) {
    console.error("Eski görsel silinemedi:", error);
  }
}
