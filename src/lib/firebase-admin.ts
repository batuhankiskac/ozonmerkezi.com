import "server-only";

import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { parsePrivateKey } from "./validation";

let warned = false;

function readAdminConfig() {
  const privateKey = parsePrivateKey(process.env);

  return {
    projectId:
      process.env.FIREBASE_PROJECT_ID ??
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ??
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };
}

function getAdminApp(): App | null {
  if (getApps().length) {
    return getApp();
  }

  const config = readAdminConfig();
  const hasServiceAccount = Boolean(config.clientEmail && config.privateKey);
  const hasApplicationDefaultCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_CONFIG,
  );

  if (
    !config.projectId ||
    (!hasServiceAccount && !hasApplicationDefaultCredentials)
  ) {
    if (!warned) {
      console.warn(
        "Firebase Admin yapılandırması eksik. Public dinamik içerikler boş döndürülecek.",
      );
      warned = true;
    }
    return null;
  }

  const credential =
    hasServiceAccount
      ? cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail!,
          privateKey: config.privateKey!,
        })
      : applicationDefault();

  return initializeApp({
    credential,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
  });
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminStorage(): Storage | null {
  const app = getAdminApp();
  return app ? getStorage(app) : null;
}
