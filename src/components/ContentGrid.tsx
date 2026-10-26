import styles from "./ContentGrid.module.css";

export default function ContentGrid({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={styles.grid}>{children}</div>;
}
