"use client";

import { useEffect } from "react";

// Kök layout dahil her şey başarısız olduğunda devreye girer. Global CSS ve
// fontlar yüklenmemiş olabileceği için yalnız satır içi stiller kullanılır.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Beklenmeyen uygulama hatası:", error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          boxSizing: "border-box",
          background: "#F2F6F8",
          color: "#13202B",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "480px", textAlign: "center" }}>
          <h1
            style={{
              margin: "0 0 1rem",
              fontSize: "1.75rem",
              lineHeight: 1.25,
              color: "#24547A",
            }}
          >
            Bir şeyler ters gitti
          </h1>
          <p style={{ margin: "0 0 1.5rem", lineHeight: 1.6 }}>
            Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen yeniden
            deneyin.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              minHeight: "44px",
              padding: "0.75rem 1.5rem",
              border: 0,
              borderRadius: "8px",
              background: "#24547A",
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Yeniden dene
          </button>
        </main>
      </body>
    </html>
  );
}
