import { describe, expect, it } from "vitest";
import {
  IMAGE_TOO_LARGE_MESSAGE,
  IMAGE_TYPE_MESSAGE,
  MAX_UPLOAD_BYTES,
  parseDownloadUrl,
  validateImageFile,
} from "@/lib/validation";

describe("validateImageFile", () => {
  it("izin verilen türleri ve boyutları kabul eder", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/avif"]) {
      expect(validateImageFile({ type, size: 1024 })).toBeNull();
    }
    expect(
      validateImageFile({ type: "image/png", size: MAX_UPLOAD_BYTES }),
    ).toBeNull();
  });

  it("desteklenmeyen türleri reddeder", () => {
    for (const type of ["image/gif", "image/svg+xml", "text/plain", ""]) {
      expect(validateImageFile({ type, size: 1024 })).toBe(IMAGE_TYPE_MESSAGE);
    }
  });

  it("boş veya 5 MB'tan büyük dosyaları reddeder", () => {
    expect(validateImageFile({ type: "image/png", size: 0 })).toBe(
      IMAGE_TOO_LARGE_MESSAGE,
    );
    expect(
      validateImageFile({ type: "image/png", size: MAX_UPLOAD_BYTES + 1 }),
    ).toBe(IMAGE_TOO_LARGE_MESSAGE);
  });

  it("gerçek File nesnesiyle çalışır", () => {
    const file = new File([new Uint8Array(10)], "a.jpg", { type: "image/jpeg" });
    expect(validateImageFile(file)).toBeNull();
  });
});

describe("parseDownloadUrl", () => {
  it("bucket ve yolu çözer", () => {
    expect(
      parseDownloadUrl(
        "https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/services%2F1-a.webp?alt=media&token=t",
      ),
    ).toEqual({ bucket: "demo.appspot.com", path: "services/1-a.webp" });
  });

  it("başka sunucu veya biçimleri reddeder", () => {
    expect(
      parseDownloadUrl("https://example.com/v0/b/demo/o/services%2Fa.webp"),
    ).toBeNull();
    expect(
      parseDownloadUrl("https://firebasestorage.googleapis.com/o/services%2Fa.webp"),
    ).toBeNull();
    expect(parseDownloadUrl("geçersiz")).toBeNull();
  });
});
