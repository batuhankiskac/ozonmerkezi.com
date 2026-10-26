import styles from "./EmptyState.module.css";

// Boş liste durumu: kısa üst etiket ve mevcut mesaj. Izgarada tam genişlik kaplar.
export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.empty} role="status">
      <span className={styles.eyebrow}>Yakında</span>
      <p className={styles.message}>{children}</p>
    </div>
  );
}
