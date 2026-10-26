import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import type { ContentCollectionConfig } from "./content-collections";
import { getAdminDb } from "./firebase-admin";
import { deleteImage, uploadImage, type UploadedImage } from "./uploads";
import {
  assertDocumentId,
  FormError,
  validateImageFile,
} from "./validation";

export type FormState = { error?: string };

function selectedFile(formData: FormData): File | null {
  const value = formData.get("image");
  return value instanceof File && value.size > 0 ? value : null;
}

function database() {
  const db = getAdminDb();
  if (!db) throw new FormError("Firebase Admin veritabanı yapılandırması eksik.");
  return db;
}

function currentImage(data: DocumentData) {
  return {
    imageUrl:
      typeof data.imageUrl === "string"
        ? data.imageUrl
        : typeof data.image === "string"
          ? data.image
          : null,
    imagePath: typeof data.imagePath === "string" ? data.imagePath : null,
  };
}

function errorState(error: unknown): FormState {
  if (error instanceof FormError) return { error: error.message };
  console.error("Admin işlemi başarısız:", error);
  return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
}

export async function saveContent(
  config: ContentCollectionConfig,
  id: string | null,
  formData: FormData,
): Promise<FormState> {
  try {
    // Tüm alanlar, görsel yüklenmeden önce doğrulanır.
    const fields = config.readFields(formData);
    const image = selectedFile(formData);
    const invalidImage = image && validateImageFile(image);
    if (invalidImage) throw new FormError(invalidImage);

    const docId = id === null ? null : assertDocumentId(id);
    const db = database();
    const collectionRef = db.collection(config.collection);

    const uploaded: UploadedImage | null = image
      ? await uploadImage(image, config.folder)
      : null;
    let replaced: ReturnType<typeof currentImage> | null = null;
    try {
      if (docId) {
        const reference = collectionRef.doc(docId);
        // Okuma ve güncelleme tek işlemde yapılır; eşzamanlı düzenlemelerde
        // gerçekten değiştirilen önceki görsel silinir.
        replaced = await db.runTransaction(async (transaction) => {
          const snapshot = await transaction.get(reference);
          if (!snapshot.exists) throw new FormError(config.notFound);
          const previous = currentImage(snapshot.data()!);
          transaction.update(reference, {
            ...fields,
            imageUrl: uploaded?.imageUrl ?? previous.imageUrl,
            imagePath: uploaded?.imagePath ?? previous.imagePath,
            updatedAt: FieldValue.serverTimestamp(),
          });
          return previous;
        });
      } else {
        await collectionRef.doc().set({
          ...fields,
          imageUrl: uploaded?.imageUrl ?? null,
          imagePath: uploaded?.imagePath ?? null,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      if (uploaded) await deleteImage(uploaded.imageUrl, uploaded.imagePath);
      throw error;
    }
    if (uploaded && replaced) {
      await deleteImage(replaced.imageUrl, replaced.imagePath);
    }
  } catch (error) {
    return errorState(error);
  }

  updateTag(config.cacheTag);
  redirect(config.listPath);
}

// Silme hataları da kaydetme işlemleriyle aynı biçimde (Türkçe mesajlı FormState)
// döner; admin arayüzü bunu gösterebilir.
export async function deleteContent(
  config: ContentCollectionConfig,
  id: string,
): Promise<FormState> {
  try {
    const docId = assertDocumentId(id);
    const db = database();
    const reference = db.collection(config.collection).doc(docId);
    const previous = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      if (!snapshot.exists) return null;
      transaction.delete(reference);
      return currentImage(snapshot.data()!);
    });
    // Belge silindikten sonra etiket hemen güncellenir; görsel silme hatası
    // belgenin silinmiş olduğu gerçeğini değiştirmez.
    updateTag(config.cacheTag);
    if (previous) await deleteImage(previous.imageUrl, previous.imagePath);
    return {};
  } catch (error) {
    return errorState(error);
  }
}
