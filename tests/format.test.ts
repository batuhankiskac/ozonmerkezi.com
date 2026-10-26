import { describe, expect, it } from "vitest";
import { formatDate } from "@/lib/format";

describe("formatDate", () => {
  it("tarihi İstanbul saat dilimine göre biçimlendirir", () => {
    // UTC 22:30, İstanbul'da (UTC+3) ertesi günün 01:30'udur.
    expect(formatDate("2024-01-31T22:30:00Z")).toBe("1 Şubat 2024");
  });

  it("Türkçe ay adlarını kullanır", () => {
    expect(formatDate("2023-08-15T09:00:00Z")).toBe("15 Ağustos 2023");
  });

  it.each(["", "geçersiz", "2024-13-45"])(
    "geçersiz girdi için boş metin döndürür: %s",
    (input) => {
      expect(formatDate(input)).toBe("");
    },
  );
});
