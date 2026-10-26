import { describe, expect, it } from "vitest";
import { excerpt, stripMarkdown } from "@/lib/text";

describe("stripMarkdown", () => {
  it("başlık, vurgu, bağlantı ve kod işaretlerini kaldırır", () => {
    expect(
      stripMarkdown(
        "## Diyabet\n\n**Kan şekeri** ve _insülin_ için [rehber](https://example.com) `kod`",
      ),
    ).toBe("Diyabet Kan şekeri ve insülin için rehber kod");
  });

  it("liste işaretlerini ve alıntıları kaldırıp boşlukları birleştirir", () => {
    expect(stripMarkdown("- Bir\n* İki\n1. Üç\n> Alıntı\n\n\nSon")).toBe(
      "Bir İki Üç Alıntı Son",
    );
  });

  it("görselleri alternatif metne çevirir", () => {
    expect(stripMarkdown("![Kapak görseli](/a.jpg) metin")).toBe(
      "Kapak görseli metin",
    );
  });

  it.each([
    ["snake_case_word değişkeni", "snake_case_word değişkeni"],
    ["dosya_adi_v2.pdf indir", "dosya_adi_v2.pdf indir"],
    ["https://example.com/yol_adi_v2 adresi", "https://example.com/yol_adi_v2 adresi"],
    ["2*3*4 = 24", "2*3*4 = 24"],
    ["şeker_oranı_yüksek ölçüm", "şeker_oranı_yüksek ölçüm"],
  ])("kelime içindeki _ ve * işaretlerini korur: %s", (input, expected) => {
    expect(stripMarkdown(input)).toBe(expected);
  });

  it("Türkçe karakterli vurguları kaldırır", () => {
    expect(stripMarkdown("**Çağrı** ve _ılık_ içecekler, __Şükrü__ *öğün*")).toBe(
      "Çağrı ve ılık içecekler, Şükrü öğün",
    );
  });

  it("vurgu içindeki kelime içi alt çizgiyi korur", () => {
    expect(stripMarkdown("_snake_case_ örneği")).toBe("snake_case örneği");
  });

  it("otomatik bağlantıları adres olarak korur", () => {
    expect(stripMarkdown("Kaynak: <https://example.com/a_b> sayfası")).toBe(
      "Kaynak: https://example.com/a_b sayfası",
    );
  });

  it("yalnızca gerçek HTML etiketlerini kaldırır", () => {
    expect(stripMarkdown("5 < 7 ve > 3 iken <strong>önemli</strong><br/>son")).toBe(
      "5 < 7 ve > 3 iken önemli son",
    );
  });
});

describe("excerpt", () => {
  it("kısa metni olduğu gibi döndürür", () => {
    expect(excerpt("**Kısa** metin")).toBe("Kısa metin");
  });

  it("uzun metni kelime sınırında kesip üç nokta ekler", () => {
    const result = excerpt("Sağlıklı yaşam için dengeli beslenme önemlidir.", 20);
    expect(result).toBe("Sağlıklı yaşam için…");
    expect(result.length).toBeLessThanOrEqual(21);
  });

  it("kesim sonundaki noktalama işaretlerini temizler", () => {
    expect(excerpt("Bir, iki, üç, dört beş", 9)).toBe("Bir, iki…");
  });

  it("varsayılan olarak 160 karakteri aşmaz", () => {
    const result = excerpt("kelime ".repeat(100));
    expect(result.length).toBeLessThanOrEqual(161);
    expect(result.endsWith("…")).toBe(true);
  });
});
