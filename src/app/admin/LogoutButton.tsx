"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./layout.module.css";

const LOGOUT_ERROR_MESSAGE = "Çıkış yapılamadı. Lütfen tekrar deneyin.";

export default function LogoutButton() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const logout = async () => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) {
        setError(LOGOUT_ERROR_MESSAGE);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      // Ağ hatasında kullanıcı tekrar deneyebilir.
      setError(LOGOUT_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={logout}
        disabled={submitting}
        className={styles.signOutButton}
      >
        {submitting ? "Çıkış yapılıyor..." : "Çıkış Yap"}
      </button>
      {error && (
        <p role="alert" className={styles.user}>
          {error}
        </p>
      )}
    </>
  );
}
