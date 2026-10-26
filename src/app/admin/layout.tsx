import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import styles from "./layout.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Paneli",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Admin Panel</div>
        {/* Bu sitede herkese açık hizmet sayfası yok; Hizmetler bölümü menüde
            gösterilmez (ortak admin kodu ve e2e testleri için rotası durur). */}
        <nav className={styles.nav} aria-label="Admin menüsü">
          <Link href="/admin/makaleler" className={styles.link}>
            Makaleler
          </Link>
          <Link href="/admin/videolar" className={styles.link}>
            Videolar
          </Link>
        </nav>
        <div className={styles.userSection}>
          <div className={styles.user}>{user.email}</div>
          <LogoutButton />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
