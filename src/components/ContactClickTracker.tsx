"use client";

import { useEffect } from "react";
import { contactMethod, pushDataLayer } from "@/lib/analytics";

// Telefon ve WhatsApp tıklamaları consent'ten bağımsız dataLayer'a yazılır;
// GTM yalnız kabul edildikten sonra yüklendiği için analiz tarafında gate edilir.
export default function ContactClickTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      const method = link ? contactMethod(link.getAttribute("href")) : null;
      if (!method) return;
      pushDataLayer({
        event: "contact_click",
        contact_method: method,
        page_path: window.location.pathname,
      });
    };
    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}
