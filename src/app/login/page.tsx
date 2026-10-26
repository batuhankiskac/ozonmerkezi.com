import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ADMIN_HOME } from "@/data/navigation";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Girişi",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getAdminSession()) {
    redirect(ADMIN_HOME);
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Girişi</h1>
        <p className={styles.brand}>Ozon Merkezi · ozonmerkezi.com</p>
        <LoginForm />
      </div>
    </main>
  );
}
