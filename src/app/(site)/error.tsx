"use client";

import { useEffect } from "react";
import StatusMessage from "@/components/StatusMessage";

export default function SiteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Public içerik yüklenemedi:", error);
  }, [error]);

  return (
    <StatusMessage
      title="İçerik şu anda yüklenemiyor"
      message="Geçici bir bağlantı sorunu oluştu. Biraz sonra yeniden deneyebilirsiniz."
      actionLabel="Yeniden dene"
      onAction={retry}
    />
  );
}
