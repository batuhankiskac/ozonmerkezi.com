export const OPEN_CONSENT_EVENT = "open-consent";

export const CONSENT_STORAGE_KEY = "analytics-consent";

const CONSENT_TYPES = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
] as const;

export function consentPayload(value: "granted" | "denied") {
  return Object.fromEntries(CONSENT_TYPES.map((type) => [type, value]));
}

// Consent Mode v2 varsayılanları ("denied") sunucuda render edilen HTML'de,
// hydration'dan önce dataLayer'a yazılır. gtm.js bu betikte YOKTUR; GTM yalnız
// kullanıcı analiz iznini verdikten sonra AnalyticsConsent tarafından eklenir.
export const CONSENT_DEFAULT_SCRIPT = `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',${JSON.stringify({ ...consentPayload("denied"), wait_for_update: 500 })});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
try{if(localStorage.getItem('${CONSENT_STORAGE_KEY}')==='accepted'){gtag('consent','update',${JSON.stringify(consentPayload("granted"))});}}catch(e){}`;
