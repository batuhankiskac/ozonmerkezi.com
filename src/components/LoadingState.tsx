import styles from "./LoadingState.module.css";

export default function LoadingState({
  label = "İçerik hazırlanıyor…",
}: {
  label?: string;
}) {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <span className={styles.bar} aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
