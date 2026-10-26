"use client";

import { OPEN_CONSENT_EVENT } from "@/lib/consent";

export default function ConsentPreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT))}
    >
      Çerez tercihleri
    </button>
  );
}
