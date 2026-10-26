import { describe, expect, it } from "vitest";
import {
  assertDocumentId,
  FormError,
  isValidDocumentId,
  optionalLines,
  parsePrivateKey,
  requiredText,
} from "@/lib/validation";

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("requiredText", () => {
  it("boşlukları kırpar", () => {
    expect(requiredText(form({ title: "  Merhaba  " }), "title", 160)).toBe(
      "Merhaba",
    );
  });

  it("sınıra eşit uzunlukta değeri kabul eder", () => {
    expect(requiredText(form({ title: "abc" }), "title", 3)).toBe("abc");
  });

  it("sınırı aşan değeri kesmeden Türkçe FormError ile reddeder", () => {
    expect(() => requiredText(form({ title: "abcdef" }), "title", 3)).toThrow(
      FormError,
    );
    expect(() => requiredText(form({ title: "abcdef" }), "title", 3)).toThrow(
      "Başlık alanı en fazla 3 karakter olabilir.",
    );
  });

  it("eksik veya boş alanda Türkçe FormError fırlatır", () => {
    expect(() => requiredText(form({}), "title", 10)).toThrow(FormError);
    expect(() => requiredText(form({ title: "   " }), "title", 10)).toThrow(
      "Başlık alanı zorunludur.",
    );
    expect(() => requiredText(form({ other: "" }), "other", 10)).toThrow(
      "other alanı zorunludur.",
    );
  });

  it("dosya değerlerini metin olarak kabul etmez", () => {
    const data = new FormData();
    data.set("title", new File(["x"], "a.txt"));
    expect(() => requiredText(data, "title", 10)).toThrow(FormError);
  });
});

describe("optionalLines", () => {
  it("boş satırları atar ve satırları kırpar", () => {
    expect(
      optionalLines(form({ citations: " a \n\n b\r\n" }), "citations", 100),
    ).toEqual(["a", "b"]);
  });

  it("alan yoksa boş dizi döndürür", () => {
    expect(optionalLines(form({}), "citations", 100)).toEqual([]);
  });

  it("önce satırlara ayırır; boş satırlar sınıra dahil edilmez", () => {
    expect(
      optionalLines(form({ citations: "abc\n\n  \ndef" }), "citations", 7),
    ).toEqual(["abc", "def"]);
  });

  it("toplam uzunluk sınırı aşılırsa veriyi kesmeden Türkçe FormError fırlatır", () => {
    expect(() =>
      optionalLines(form({ citations: "abc\ndef" }), "citations", 5),
    ).toThrow(FormError);
    expect(() =>
      optionalLines(form({ citations: "abc\ndef" }), "citations", 5),
    ).toThrow("Kaynakça alanı en fazla 5 karakter olabilir.");
  });
});

describe("belge kimliği doğrulaması", () => {
  it("geçerli Firestore kimliklerini kabul eder", () => {
    expect(isValidDocumentId("aB3_-x")).toBe(true);
    expect(isValidDocumentId("a".repeat(128))).toBe(true);
    expect(assertDocumentId("Xyz123")).toBe("Xyz123");
  });

  it("geçersiz kimlikleri reddeder", () => {
    for (const id of ["", "a/b", "../x", "a b", "a".repeat(129), "ç", 42, null]) {
      expect(isValidDocumentId(id)).toBe(false);
    }
    expect(() => assertDocumentId("a/b")).toThrow("Geçersiz kayıt.");
  });
});

describe("parsePrivateKey", () => {
  const pem = "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n";

  it("kaçışlı \\n içeren anahtarı çözer", () => {
    expect(
      parsePrivateKey({ FIREBASE_PRIVATE_KEY: pem.replace(/\n/g, "\\n") }),
    ).toBe(pem.trim());
  });

  it("tırnaklı anahtarı çözer", () => {
    expect(
      parsePrivateKey({
        FIREBASE_PRIVATE_KEY: `"${pem.replace(/\n/g, "\\n")}"`,
      }),
    ).toBe(pem.trim());
  });

  it("base64 anahtarı önceliklidir", () => {
    expect(
      parsePrivateKey({
        FIREBASE_PRIVATE_KEY_BASE64: Buffer.from(pem).toString("base64"),
        FIREBASE_PRIVATE_KEY: "yanlış",
      }),
    ).toBe(pem.trim());
  });

  it("tanımsız veya boşsa undefined döndürür", () => {
    expect(parsePrivateKey({})).toBeUndefined();
    expect(
      parsePrivateKey({ FIREBASE_PRIVATE_KEY_BASE64: "  ", FIREBASE_PRIVATE_KEY: "" }),
    ).toBeUndefined();
  });
});
