"use client";

import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_HOME } from "@/data/navigation";
import { auth } from "@/firebase/config";
import styles from "./page.module.css";

function authErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "E-posta veya şifre hatalı.";
    case "auth/too-many-requests":
      return "Çok fazla başarısız deneme yapıldı. Lütfen biraz sonra tekrar deneyin.";
    case "auth/network-request-failed":
      return "Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.";
    default:
      return "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
  }
}

async function sessionError(response: Response): Promise<string> {
  try {
    const result = (await response.json()) as { error?: unknown };
    if (typeof result.error === "string" && result.error) return result.error;
  } catch {
    // JSON olmayan yanıtlar için genel mesaj gösterilir.
  }
  return "Oturum oluşturulamadı. Lütfen tekrar deneyin.";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!auth) {
      setError("Firebase istemci yapılandırması eksik.");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        setError(await sessionError(response));
        return;
      }

      router.replace(ADMIN_HOME);
      router.refresh();
    } catch (loginError) {
      setError(authErrorMessage(loginError));
    } finally {
      await signOut(auth).catch(() => undefined);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="email">E-posta</label>
        <input
          type="email"
          id="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Şifre</label>
        <input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className={styles.input}
        />
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={styles.button} disabled={submitting}>
        {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
