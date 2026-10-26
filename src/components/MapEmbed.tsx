"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MapEmbed.module.css";

interface MapEmbedProps {
  // Google Haritalar "embed" bağlantısı (contact.json mapEmbedUrl).
  embedUrl: string;
  title: string;
}

// İçerik güvenlik politikası çerçeveye yalnız www.google.com'a izin verir;
// harita adresi bu hosta yönlendirilir.
function toAllowedEmbedSrc(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    url.protocol = "https:";
    url.hostname = "www.google.com";
    return url.toString();
  } catch {
    return "";
  }
}

// Google Haritalar içeriği yalnızca kullanıcı istediğinde yüklenir.
export default function MapEmbed({ embedUrl, title }: MapEmbedProps) {
  const src = toAllowedEmbedSrc(embedUrl);
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Buton kaldırıldığında klavye odağı haritaya taşınır.
  useEffect(() => {
    if (isLoaded) iframeRef.current?.focus();
  }, [isLoaded]);

  return (
    <div className={styles.frame}>
      {isLoaded ? (
        <iframe
          ref={iframeRef}
          title={title}
          src={src}
          className={styles.iframe}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className={styles.placeholder}>
          <svg
            className={styles.pin}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 21s-6.5-5.6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
            <circle cx="12" cy="9.8" r="2.3" />
          </svg>
          <p className={styles.note}>
            Harita, Google Haritalar üzerinden yüklenir. Gösterdiğinizde Google
            içeriği yüklenecek ve Google çerez kullanabilecektir.
          </p>
          <button
            type="button"
            className={styles.button}
            onClick={() => setIsLoaded(true)}
          >
            Haritayı göster
          </button>
        </div>
      )}
    </div>
  );
}
