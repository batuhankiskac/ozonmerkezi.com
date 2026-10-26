import { describe, expect, it } from "vitest";
import {
  imageUrl,
  isoDate,
  newestFirst,
  optionalText,
  text,
  toArticle,
  toArticleSummary,
  toService,
  toVideo,
} from "@/lib/normalize";

const timestamp = (iso: string) => ({ toDate: () => new Date(iso) });

describe("text / optionalText", () => {
  it("yalnız string değerleri kabul eder", () => {
    expect(text("a")).toBe("a");
    expect(text(5)).toBe("");
    expect(text(null)).toBe("");
  });

  it("boş veya yalnız boşluk içeren metni null yapar", () => {
    expect(optionalText("  x  ")).toBe("x");
    expect(optionalText("   ")).toBeNull();
    expect(optionalText(undefined)).toBeNull();
  });
});

describe("isoDate", () => {
  it("Timestamp benzeri toDate nesnelerini çevirir", () => {
    expect(isoDate(timestamp("2024-03-01T10:00:00.000Z"))).toBe(
      "2024-03-01T10:00:00.000Z",
    );
  });

  it("Date ve geçerli string değerlerini çevirir", () => {
    expect(isoDate(new Date("2024-01-02T00:00:00.000Z"))).toBe(
      "2024-01-02T00:00:00.000Z",
    );
    expect(isoDate("2024-01-02T03:04:05Z")).toBe("2024-01-02T03:04:05.000Z");
  });

  it("serileştirilmiş { seconds } nesnesini çevirir", () => {
    expect(isoDate({ seconds: 0, nanoseconds: 0 })).toBe(
      "1970-01-01T00:00:00.000Z",
    );
  });

  it("geçersiz tarihlerde hata fırlatmadan null döner", () => {
    expect(isoDate("tarih değil")).toBeNull();
    expect(isoDate("")).toBeNull();
    expect(isoDate(new Date("x"))).toBeNull();
    expect(isoDate({ toDate: () => new Date("x") })).toBeNull();
    expect(
      isoDate({
        toDate: () => {
          throw new Error("bozuk");
        },
      }),
    ).toBeNull();
    expect(isoDate(123)).toBeNull();
    expect(isoDate(null)).toBeNull();
  });
});

describe("imageUrl", () => {
  it("imageUrl alanını tercih eder, yoksa eski image alanına düşer", () => {
    expect(imageUrl({ imageUrl: "/a.jpg", image: "/b.jpg" })).toBe("/a.jpg");
    expect(imageUrl({ imageUrl: " ", image: "/b.jpg" })).toBe("/b.jpg");
    expect(imageUrl({ image: "/b.jpg" })).toBe("/b.jpg");
    expect(imageUrl({})).toBeNull();
  });
});

describe("normalizer'lar", () => {
  it("makale özetini eksik alanlarla güvenle oluşturur", () => {
    expect(toArticleSummary("a1", { title: 1, image: "/eski.jpg" })).toEqual({
      id: "a1",
      title: "",
      summary: "",
      imageUrl: "/eski.jpg",
      createdAt: null,
      updatedAt: null,
    });
  });

  it("makale kaynaklarından string olmayan ve boş öğeleri ayıklar", () => {
    const article = toArticle("a2", {
      title: "Başlık",
      content: "İçerik",
      citations: ["Kaynak 1", 42, null, "  ", "Kaynak 2"],
      createdAt: timestamp("2024-05-05T00:00:00.000Z"),
    });
    expect(article.citations).toEqual(["Kaynak 1", "Kaynak 2"]);
    expect(article.content).toBe("İçerik");
    expect(article.createdAt).toBe("2024-05-05T00:00:00.000Z");
  });

  it("kaynak alanı dizi değilse boş dizi döner", () => {
    expect(toArticle("a3", { citations: "tek" }).citations).toEqual([]);
  });

  it("hizmet ve video belgelerini çevirir", () => {
    expect(
      toService("s1", { title: "Diyabet", description: "Metin" }),
    ).toMatchObject({ id: "s1", title: "Diyabet", description: "Metin" });
    expect(
      toVideo("v1", { youtubeId: "dQw4w9WgXcQ", imageUrl: "/t.jpg" }),
    ).toMatchObject({
      id: "v1",
      youtubeId: "dQw4w9WgXcQ",
      imageUrl: "/t.jpg",
    });
  });

  it("geçersiz YouTube kimliği olan videoyu null yapar", () => {
    const invalid = [
      "",
      "abc",
      "dQw4w9WgXc",
      "dQw4w9WgXcQQ",
      "dQw4w9Wg/cQ",
      '"><script>',
      42,
      undefined,
    ];
    for (const youtubeId of invalid) {
      expect(toVideo("v2", { title: "x", youtubeId })).toBeNull();
    }
  });
});

describe("newestFirst", () => {
  it("yeniden eskiye sıralar, tarihsizleri sona koyar ve girdiyi değiştirmez", () => {
    const items = [
      { id: "eski", createdAt: "2023-01-01T00:00:00.000Z" },
      { id: "tarihsiz", createdAt: null },
      { id: "yeni", createdAt: "2024-01-01T00:00:00.000Z" },
    ];
    expect(newestFirst(items).map((item) => item.id)).toEqual([
      "yeni",
      "eski",
      "tarihsiz",
    ]);
    expect(items[0].id).toBe("eski");
  });
});
