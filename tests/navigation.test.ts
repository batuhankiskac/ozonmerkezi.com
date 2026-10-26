import { describe, expect, it } from "vitest";
import { isActivePath, navigationLinks } from "@/data/navigation";

describe("isActivePath", () => {
  it("ana sayfayı yalnızca tam eşleşmede etkin sayar", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/makaleler", "/")).toBe(false);
  });

  it("bölüm sayfasını ve alt sayfalarını etkin sayar", () => {
    expect(isActivePath("/makaleler", "/makaleler")).toBe(true);
    expect(isActivePath("/makaleler/ozon-tedavisi-nedir", "/makaleler")).toBe(
      true,
    );
    expect(isActivePath("/makaleler/a/b", "/makaleler")).toBe(true);
  });

  it("benzer önekli yolları eşleştirmez", () => {
    expect(isActivePath("/makalelerx", "/makaleler")).toBe(false);
    expect(isActivePath("/videolar", "/makaleler")).toBe(false);
  });
});

describe("navigationLinks", () => {
  it("makaleler sayfasını ve iletişim bağlantısını içerir", () => {
    const hrefs = navigationLinks.map((link) => link.href);
    expect(hrefs).toContain("/makaleler");
    expect(hrefs).toContain("/iletisim");
  });
});
