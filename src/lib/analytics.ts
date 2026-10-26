// GTM ve dataLayer yardımcıları. dataLayer'a yazan tüm kod buradan geçer.

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const GTM_ID = "GTM-5DGZ7QV3";

// dataLayer yoksa oluşturur.
function ensureDataLayer(): unknown[] {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function pushDataLayer(entry: Record<string, unknown>) {
  ensureDataLayer().push(entry);
}

// gtag komutları dizi değil arguments nesnesi olarak beklenir.
export const gtag: (...args: unknown[]) => void = function () {
  // eslint-disable-next-line prefer-rest-params
  ensureDataLayer().push(arguments);
};

// GTM konteyneri en fazla bir kez ve yalnız kabul edildikten sonra yüklenir.
// Consent update olayı, gtm.js'ten önce dataLayer'a yazılmış olmalıdır.
let gtmRequested = false;
export function loadGtm() {
  if (gtmRequested) return;
  gtmRequested = true;
  pushDataLayer({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

// Telefon ve WhatsApp bağlantıları (makale içindekiler dahil) GTM'de
// dönüşüm etiketi tetiklemek için tek bir olayla bildirilir.
export function contactMethod(href: string | null): "phone" | "whatsapp" | null {
  const value = href ?? "";
  if (value.startsWith("tel:")) return "phone";
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(value)) return "whatsapp";
  return null;
}
