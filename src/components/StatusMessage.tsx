import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import buttonStyles from "@/styles/button.module.css";
import styles from "./StatusMessage.module.css";

type StatusAction = { href: string } | { onAction: () => void };

type StatusMessageProps = {
  eyebrow?: string;
  title: string;
  message: string;
  actionLabel: string;
} & StatusAction;

// Hata ve 404 ekranlarının ortak kabuğu: sol hizalı editoryal başlık, mesaj ve tek bir eylem.
export default function StatusMessage({
  eyebrow,
  title,
  message,
  actionLabel,
  ...action
}: StatusMessageProps) {
  const label = (
    <>
      {actionLabel}
      <ArrowIcon className={buttonStyles.icon} />
    </>
  );

  return (
    <main id="main-content" className={styles.container}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      {"href" in action ? (
        <Link href={action.href} className={styles.action}>
          {label}
        </Link>
      ) : (
        <button
          type="button"
          className={styles.action}
          onClick={() => action.onAction()}
        >
          {label}
        </button>
      )}
    </main>
  );
}
