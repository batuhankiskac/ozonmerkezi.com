"use client";

import { useEffect } from "react";
import styles from "./layout.module.css";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Admin işlemi başarısız:", error);
  }, [error]);

  return (
    <section className={styles.errorBox} role="alert">
      <h1>Bir hata oluştu</h1>
      <p>
        İşlem tamamlanamadı. Bağlantınızı kontrol edip yeniden deneyebilirsiniz.
      </p>
      <button type="button" className={styles.retryButton} onClick={retry}>
        Yeniden dene
      </button>
    </section>
  );
}
