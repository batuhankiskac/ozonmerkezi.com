import { expect, test, type Page } from "@playwright/test";

test("ana sayfa ve temel navigasyon erişilebilir", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Medikal Ozon Tedavisi/ }),
  ).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "Menü", exact: true }).click();
  }
  const navigation = page.getByRole("navigation", { name: "Ana menü" });
  await expect(navigation).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Yöntemler", exact: true }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Randevu Al", exact: true }),
  ).toBeVisible();
});

test("public içerik sayfaları yükleniyor metnine bağımlı değil", async ({
  page,
}) => {
  for (const path of ["/makaleler", "/videolar", "/iletisim"]) {
    await page.goto(path);
    await expect(page.getByText("İçerik hazırlanıyor…")).toHaveCount(0);
    await expect(page.locator("main h1")).toBeVisible();
  }
});

test("kaldırılan ve eski rotalar 404 döner", async ({ request }) => {
  for (const path of ["/hizmetler", "/hakkinda", "/faydalar", "/index.html"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
  }
});

test("ana sayfa bağlantıları diğer sayfalardan ana sayfaya gider", async ({
  page,
  isMobile,
}) => {
  await page.goto("/iletisim");
  if (isMobile) {
    await page.getByRole("button", { name: "Menü", exact: true }).click();
  }
  await page
    .getByRole("navigation", { name: "Ana menü" })
    .getByRole("link", { name: "Yöntemler", exact: true })
    .click();
  await expect(page).toHaveURL(/\/#yontemler$/);
  await expect(page.locator("#yontemler")).toBeVisible();
});

test("mobil menü Escape ile kapanır", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Yalnız mobil projede çalışır.");
  await page.goto("/");
  const menuButton = page.locator('button[aria-controls="primary-navigation"]');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
});

test("analiz tercihi saklanır", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("complementary", {
    name: "Çerez tercihleri",
  });
  await expect(banner).toBeVisible();
  await page.getByRole("button", { name: "Reddet" }).click();
  await expect(banner).toHaveCount(0);
  await page.reload();
  await expect(banner).toHaveCount(0);
  await page.getByRole("button", { name: "Çerez tercihleri" }).click();
  await expect(page.getByRole("dialog", { name: "Çerez tercihleri" })).toBeVisible();
});

test("çerez paneli Escape ile kapanır ve odağı geri verir", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("analytics-consent", "rejected"));
  await page.reload();
  const trigger = page.getByRole("button", { name: "Çerez tercihleri" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Çerez tercihleri" });
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog.getByRole("button", { name: "Kapat" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("içeriğe atla bağlantısı ana içeriğe odaklanır", async ({ page }) => {
  await page.goto("/makaleler");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "İçeriğe atla" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");
});

test("gizlilik sayfası KVKK metnini ve veri sorumlusunu gösterir", async ({
  page,
}) => {
  await page.goto("/gizlilik");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Gizlilik ve Çerez Politikası / KVKK Aydınlatma Metni",
    }),
  ).toBeVisible();
  await expect(page.getByText("Bu metin bir şablondur.")).toBeVisible();
});

test("consent varsayılanı reddedilmiş başlar; GTM kabul edilene kadar yüklenmez", async ({
  page,
}) => {
  await page.goto("/iletisim");
  await page.waitForFunction(() =>
    (window.dataLayer ?? []).some(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        (entry as ArrayLike<unknown>)[0] === "consent" &&
        (entry as ArrayLike<unknown>)[1] === "default",
    ),
  );
  await expect(
    page.locator('script[src*="googletagmanager.com/gtm.js"]'),
  ).toHaveCount(0);
  const consentDefault = await page.evaluate(() => {
    const entry = (window.dataLayer ?? []).find(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        (item as ArrayLike<unknown>)[0] === "consent" &&
        (item as ArrayLike<unknown>)[1] === "default",
    ) as ArrayLike<unknown> | undefined;
    return entry?.[2];
  });
  expect(consentDefault).toMatchObject({ ad_storage: "denied" });

  // Bağlantının açılmasını engelleyip yalnız olayı doğrula.
  await page.evaluate(() =>
    document.addEventListener("click", (event) => event.preventDefault()),
  );
  await page
    .getByRole("main")
    .getByRole("link", { name: "WhatsApp üzerinden yaz" })
    .click();
  const events = await page.evaluate(() =>
    (window.dataLayer ?? []).filter(
      (entry) => (entry as { event?: string }).event === "contact_click",
    ),
  );
  expect(events).toContainEqual(
    expect.objectContaining({ contact_method: "whatsapp" }),
  );
});

test("kabul edilene kadar GTM betiği eklenmez, kabulden sonra eklenir", async ({
  page,
}) => {
  await page.goto("/");
  const gtmScript = page.locator('script[src*="googletagmanager.com/gtm.js"]');
  await expect(page.getByRole("button", { name: "Kabul Et" })).toBeVisible();
  await expect(gtmScript).toHaveCount(0);
  await page.getByRole("button", { name: "Kabul Et" }).click();
  await expect(gtmScript).toHaveCount(1);
});

test("aktif sayfa bağlantısı işaretlenir", async ({ page, isMobile }) => {
  await page.goto("/iletisim");
  if (isMobile) {
    await page.getByRole("button", { name: "Menü", exact: true }).click();
  }
  const navigation = page.getByRole("navigation", { name: "Ana menü" });
  await expect(
    navigation.getByRole("link", { name: "Randevu Al", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    navigation.getByRole("link", { name: "Yöntemler", exact: true }),
  ).not.toHaveAttribute("aria-current", "page");
});

test("makaleler sayfasında Makaleler bağlantısı işaretlenir", async ({
  page,
  isMobile,
}) => {
  await page.goto("/makaleler");
  if (isMobile) {
    await page.getByRole("button", { name: "Menü", exact: true }).click();
  }
  await expect(
    page
      .getByRole("navigation", { name: "Ana menü" })
      .getByRole("link", { name: "Makaleler", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("anonim admin isteği login sayfasına yönlenir", async ({ page }) => {
  await page.goto("/admin/hizmetler");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Admin Girişi" }),
  ).toBeVisible();
});

test("sahte admin cookie'si sunucu doğrulamasını geçemez", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "admin_session",
      value: "sahte-session",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Strict",
    },
  ]);
  await page.goto("/admin/hizmetler");
  await expect(page).toHaveURL(/\/login$/);
});

test("sitemap olmayan video detay rotaları üretmez", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).not.toMatch(/\/videolar\/[^<]+/);
});

test("temel güvenlik başlıkları gönderilir", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(response.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
});

const adminCredentialsAvailable = Boolean(
  process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD,
);

// Test yarıda kalsa bile oluşturulan geçici hizmetler arayüzden silinir.
async function deleteServicesMatching(page: Page, title: string) {
  await page.goto("/admin/hizmetler");
  if (!/\/admin\/hizmetler$/.test(page.url())) return;
  const items = page.getByRole("article").filter({ hasText: title });
  for (let attempt = 0; attempt < 5 && (await items.count()) > 0; attempt++) {
    const remaining = await items.count();
    page.once("dialog", (dialog) => dialog.accept());
    await items.first().getByRole("button", { name: "Sil" }).click();
    await expect(items).toHaveCount(remaining - 1);
  }
}

test("admin login, hizmet CRUD ve logout akışı", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Paylaşılan veriyi değiştirdiği için yalnız desktop projesinde çalışır.",
  );
  test.skip(
    !adminCredentialsAvailable,
    "Firebase admin E2E bilgileri tanımlı değil.",
  );

  const uniqueTitle = `E2E Hizmet ${Date.now()}`;
  const updatedTitle = `${uniqueTitle} Güncel`;

  await page.goto("/login");
  await page.getByLabel("E-posta").fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel("Şifre").fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Giriş Yap" }).click();
  await expect(page).toHaveURL(/\/admin\/makaleler$/);
  await page.goto("/admin/hizmetler");

  try {
    await page.getByRole("link", { name: "Yeni Hizmet Ekle" }).click();
    await page.getByLabel("Başlık").fill(uniqueTitle);
    await page
      .getByLabel("Açıklama (Markdown)")
      .fill("Playwright tarafından oluşturulan geçici hizmet.");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByRole("heading", { name: uniqueTitle })).toBeVisible();

    const createdItem = page
      .getByRole("article")
      .filter({ hasText: uniqueTitle });
    await createdItem.getByRole("link", { name: "Düzenle" }).click();
    await page.getByLabel("Başlık").fill(updatedTitle);
    await page.getByRole("button", { name: "Güncelle" }).click();
    await expect(
      page.getByRole("heading", { name: updatedTitle }),
    ).toBeVisible();

    const updatedItem = page
      .getByRole("article")
      .filter({ hasText: updatedTitle });
    page.once("dialog", (dialog) => dialog.accept());
    await updatedItem.getByRole("button", { name: "Sil" }).click();
    await expect(
      page.getByRole("heading", { name: updatedTitle }),
    ).toHaveCount(0);
  } finally {
    // Güncellenmiş başlık da benzersiz öneki içerir.
    await deleteServicesMatching(page, uniqueTitle);
  }

  await page.getByRole("button", { name: "Çıkış Yap" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
