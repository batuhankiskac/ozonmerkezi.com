import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminDb: vi.fn(),
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  updateTag: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  set: vi.fn(),
  tx: { get: vi.fn(), update: vi.fn(), delete: vi.fn() },
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { serverTimestamp: () => "SERVER_TS" },
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag }));
vi.mock("@/lib/firebase-admin", () => ({ getAdminDb: mocks.getAdminDb }));
vi.mock("@/lib/uploads", () => ({
  uploadImage: mocks.uploadImage,
  deleteImage: mocks.deleteImage,
}));

import {
  articleCollection,
  serviceCollection,
  videoCollection,
} from "@/lib/content-collections";
import { deleteContent, saveContent } from "@/lib/content-admin";

const docRef = { id: "doc-1" };
// doc(id) mevcut belge referansını, doc() ise yeni belge için set() içeren nesneyi döner.
const docFn = (id?: string) => (id ? docRef : { set: mocks.set });
const db = {
  collection: vi.fn((): { doc: typeof docFn } => ({ doc: docFn })),
  runTransaction: vi.fn(async (work: (tx: typeof mocks.tx) => unknown) =>
    work(mocks.tx),
  ),
};

function form(fields: Record<string, string>, image?: File) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  if (image) data.set("image", image);
  return data;
}

const articleFields = {
  title: "Başlık",
  summary: "Özet",
  content: "İçerik",
  citations: "",
};

function png(name = "foto.png") {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/png" });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAdminDb.mockReturnValue(db);
  mocks.set.mockReset();
  mocks.tx.get.mockResolvedValue({ exists: true, data: () => ({}) });
});

describe("saveContent (oluşturma)", () => {
  it("görselsiz yeni makaleyi kaydeder, etiketi günceller ve listeye yönlendirir", async () => {
    await expect(
      saveContent(articleCollection, null, form(articleFields)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/makaleler");

    expect(db.collection).toHaveBeenCalledWith("articles");
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Başlık",
        summary: "Özet",
        content: "İçerik",
        imageUrl: null,
        imagePath: null,
        createdAt: "SERVER_TS",
        updatedAt: "SERVER_TS",
      }),
    );
    expect(mocks.uploadImage).not.toHaveBeenCalled();
    expect(mocks.updateTag).toHaveBeenCalledWith("articles");
  });

  it("görselli yeni hizmeti yükler ve kayıtta yükleme bilgisini yazar", async () => {
    mocks.uploadImage.mockResolvedValue({
      imageUrl: "https://img/new",
      imagePath: "services/new.webp",
    });

    await expect(
      saveContent(
        serviceCollection,
        null,
        form({ title: "Hizmet", description: "Açıklama" }, png()),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/hizmetler");

    expect(mocks.uploadImage).toHaveBeenCalledWith(expect.any(File), "services");
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: "https://img/new",
        imagePath: "services/new.webp",
      }),
    );
    expect(mocks.updateTag).toHaveBeenCalledWith("services");
  });

  it("alan doğrulaması başarısızsa hata döner ve hiçbir şey yazmaz", async () => {
    const result = await saveContent(
      articleCollection,
      null,
      form({ ...articleFields, title: "" }),
    );

    expect(result.error).toBeTruthy();
    expect(mocks.set).not.toHaveBeenCalled();
    expect(mocks.uploadImage).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("geçersiz görsel türünü yüklemeden reddeder", async () => {
    const pdf = new File([new Uint8Array([1])], "belge.pdf", {
      type: "application/pdf",
    });

    const result = await saveContent(
      articleCollection,
      null,
      form(articleFields, pdf),
    );

    expect(result.error).toBeTruthy();
    expect(mocks.uploadImage).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("kayıt hatasında yüklenen görseli temizler", async () => {
    mocks.uploadImage.mockResolvedValue({
      imageUrl: "https://img/new",
      imagePath: "articles/new.webp",
    });
    mocks.set.mockRejectedValue(new Error("firestore down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await saveContent(
      articleCollection,
      null,
      form(articleFields, png()),
    );
    consoleError.mockRestore();

    expect(result).toEqual({ error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." });
    expect(mocks.deleteImage).toHaveBeenCalledWith(
      "https://img/new",
      "articles/new.webp",
    );
    expect(mocks.updateTag).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("saveContent (güncelleme)", () => {
  it("var olmayan belge için Türkçe 'bulunamadı' hatası döner", async () => {
    mocks.tx.get.mockResolvedValue({ exists: false });

    const result = await saveContent(
      videoCollection,
      "missing",
      form({ title: "Video", url: "https://youtu.be/dQw4w9WgXcQ" }),
    );

    expect(result).toEqual({ error: "Video bulunamadı." });
    expect(mocks.tx.update).not.toHaveBeenCalled();
    expect(mocks.updateTag).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("bulunamadı durumunda yüklenen yeni görseli siler", async () => {
    mocks.tx.get.mockResolvedValue({ exists: false });
    mocks.uploadImage.mockResolvedValue({
      imageUrl: "https://img/orphan",
      imagePath: "articles/orphan.webp",
    });

    const result = await saveContent(
      articleCollection,
      "missing",
      form(articleFields, png()),
    );

    expect(result).toEqual({ error: "Makale bulunamadı." });
    expect(mocks.deleteImage).toHaveBeenCalledWith(
      "https://img/orphan",
      "articles/orphan.webp",
    );
  });

  it("yeni görsel seçilince eski görseli siler ve güncellenen alanları yazar", async () => {
    mocks.tx.get.mockResolvedValue({
      exists: true,
      data: () => ({
        imageUrl: "https://img/old",
        imagePath: "articles/old.webp",
      }),
    });
    mocks.uploadImage.mockResolvedValue({
      imageUrl: "https://img/new",
      imagePath: "articles/new.webp",
    });

    await expect(
      saveContent(articleCollection, "doc-1", form(articleFields, png())),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/makaleler");

    expect(mocks.tx.update).toHaveBeenCalledWith(
      docRef,
      expect.objectContaining({
        title: "Başlık",
        imageUrl: "https://img/new",
        imagePath: "articles/new.webp",
        updatedAt: "SERVER_TS",
      }),
    );
    expect(mocks.deleteImage).toHaveBeenCalledTimes(1);
    expect(mocks.deleteImage).toHaveBeenCalledWith(
      "https://img/old",
      "articles/old.webp",
    );
    expect(mocks.updateTag).toHaveBeenCalledWith("articles");
  });

  it("yeni görsel yoksa mevcut görseli korur ve hiçbir görseli silmez", async () => {
    mocks.tx.get.mockResolvedValue({
      exists: true,
      data: () => ({
        imageUrl: "https://img/keep",
        imagePath: "articles/keep.webp",
      }),
    });

    await expect(
      saveContent(articleCollection, "doc-1", form(articleFields)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/makaleler");

    expect(mocks.uploadImage).not.toHaveBeenCalled();
    expect(mocks.tx.update).toHaveBeenCalledWith(
      docRef,
      expect.objectContaining({
        imageUrl: "https://img/keep",
        imagePath: "articles/keep.webp",
      }),
    );
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  it("geçersiz belge kimliğini reddeder", async () => {
    const result = await saveContent(
      articleCollection,
      "../etc",
      form(articleFields),
    );

    expect(result.error).toBeTruthy();
    expect(mocks.tx.update).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("deleteContent", () => {
  it("belgeyi siler, etiketi günceller ve eski görseli temizler", async () => {
    mocks.tx.get.mockResolvedValue({
      exists: true,
      data: () => ({
        imageUrl: "https://img/old",
        imagePath: "videos/old.webp",
      }),
    });

    const result = await deleteContent(videoCollection, "doc-1");

    expect(result).toEqual({});
    expect(mocks.tx.delete).toHaveBeenCalledWith(docRef);
    expect(mocks.updateTag).toHaveBeenCalledWith("videos");
    expect(mocks.deleteImage).toHaveBeenCalledWith(
      "https://img/old",
      "videos/old.webp",
    );
  });

  it("belge yoksa görsel silmeden boş sonuç döner", async () => {
    mocks.tx.get.mockResolvedValue({ exists: false });

    const result = await deleteContent(serviceCollection, "doc-1");

    expect(result).toEqual({});
    expect(mocks.tx.delete).not.toHaveBeenCalled();
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  it("veritabanı yapılandırması yoksa Türkçe hata döner", async () => {
    mocks.getAdminDb.mockReturnValue(null);

    const result = await deleteContent(articleCollection, "doc-1");

    expect(result).toEqual({
      error: "Firebase Admin veritabanı yapılandırması eksik.",
    });
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});
