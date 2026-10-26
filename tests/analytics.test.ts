import { describe, expect, it } from "vitest";
import { contactMethod } from "@/lib/analytics";

describe("contactMethod", () => {
  it("telefon bağlantısını phone olarak sınıflandırır", () => {
    expect(contactMethod("tel:+905551112233")).toBe("phone");
  });

  it("wa.me ve api.whatsapp.com bağlantılarını whatsapp olarak sınıflandırır", () => {
    expect(contactMethod("https://wa.me/905551112233")).toBe("whatsapp");
    expect(
      contactMethod("https://api.whatsapp.com/send?phone=905551112233"),
    ).toBe("whatsapp");
  });

  it("diğer bağlantılar için null döner", () => {
    expect(contactMethod("https://example.com")).toBeNull();
    expect(contactMethod("/iletisim")).toBeNull();
    expect(contactMethod("mailto:info@example.com")).toBeNull();
    expect(contactMethod("http://wa.me/905551112233")).toBeNull();
  });

  it("href yoksa null döner", () => {
    expect(contactMethod(null)).toBeNull();
  });
});
