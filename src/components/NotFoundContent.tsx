import StatusMessage from "./StatusMessage";

// Hem (site) hem kök 404 sayfası bu içeriği kullanır.
export default function NotFoundContent() {
  return (
    <StatusMessage
      eyebrow="404"
      title="Sayfa bulunamadı"
      message="Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya hiç var olmamış olabilir."
      actionLabel="Ana sayfaya dön"
      href="/"
    />
  );
}
