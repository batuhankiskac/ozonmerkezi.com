// Firestore tohumlama betiği: seed/content.json içindeki içeriği articles,
// services ve videos koleksiyonlarına, JSON'daki kimliklerle (doküman id)
// yazar. Alan adları ve türleri src/app/admin/actions.ts ile aynıdır.
//
//   npm run seed                 Eksik belgeleri oluşturur; mevcutlara dokunmaz.
//   npm run seed -- --dry-run    Hiçbir şey yazmadan ne yapılacağını listeler.
//   npm run seed -- --force      Mevcut belgeleri seed verisiyle günceller.
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const ENV_FILE = fileURLToPath(new URL("../.env.local", import.meta.url));
const CONTENT_FILE = fileURLToPath(new URL("../seed/content.json", import.meta.url));
const COLLECTIONS = ["articles", "services", "videos"];
const BATCH_SIZE = 400;

// .env.local varsa yüklenir; süreç ortamındaki mevcut değerler ezilmez.
if (existsSync(ENV_FILE) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(ENV_FILE);
}

// scripts/migrate-image-fields.mjs ve src/lib/validation.ts ile aynı kurallar:
// base64 değeri önceliklidir, tırnaklar kaldırılır, kaçışlı \n gerçek satır sonuna çevrilir.
function parsePrivateKey(env) {
  const base64 = env.FIREBASE_PRIVATE_KEY_BASE64?.trim();
  const raw = base64
    ? Buffer.from(base64, "base64").toString("utf8")
    : env.FIREBASE_PRIVATE_KEY;
  if (!raw) return undefined;
  const key = raw
    .trim()
    .replace(/^(["'])([\s\S]*)\1$/, "$2")
    .replace(/\\n/g, "\n")
    .trim();
  return key || undefined;
}

function readCredentials() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = parsePrivateKey(process.env);
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

function textOf(item, field, collection) {
  const value = typeof item[field] === "string" ? item[field].trim() : "";
  if (!value) throw new Error(`${collection}/${item.id}: "${field}" alanı boş olamaz.`);
  return value;
}

function stringList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function youtubeIdOf(item) {
  const raw = typeof item.youtubeId === "string" ? item.youtubeId.trim() : "";
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const url = typeof item.url === "string" ? item.url : "";
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (match) return match[1];
  throw new Error(`videos/${item.id}: geçerli bir YouTube kimliği yok.`);
}

// Yalnız bilinen alanlar yazılır; seed dosyasındaki ek alanlar atılır.
function documentFor(collection, item) {
  const imageUrl =
    typeof item.imageUrl === "string" && item.imageUrl.trim() ? item.imageUrl.trim() : null;
  if (collection === "articles") {
    return {
      title: textOf(item, "title", collection),
      summary: textOf(item, "summary", collection),
      content: textOf(item, "content", collection),
      citations: stringList(item.citations),
      imageUrl,
      imagePath: null,
    };
  }
  if (collection === "services") {
    return {
      title: textOf(item, "title", collection),
      description: textOf(item, "description", collection),
      imageUrl,
      imagePath: null,
    };
  }
  return {
    title: textOf(item, "title", collection),
    youtubeId: youtubeIdOf(item),
    imageUrl,
    imagePath: null,
  };
}

// Doküman kimliği Firestore kurallarına uymalı: boş değil, "/" içermez, "." veya ".." değil.
function assertId(collection, id) {
  if (typeof id !== "string" || !id.trim() || id.includes("/") || id === "." || id === "..") {
    throw new Error(`${collection}: geçersiz doküman kimliği "${id}".`);
  }
  return id.trim();
}

function buildPlan(content) {
  const plan = [];
  for (const collection of COLLECTIONS) {
    const items = Array.isArray(content[collection]) ? content[collection] : [];
    for (const item of items) {
      const id = assertId(collection, item.id);
      plan.push({ collection, id, data: documentFor(collection, { ...item, id }) });
    }
  }
  return plan;
}

function parseArgs(argv) {
  const known = new Set(["--force", "--dry-run"]);
  const unknown = argv.filter((arg) => !known.has(arg));
  if (unknown.length) throw new Error(`Bilinmeyen argüman: ${unknown.join(", ")}`);
  return { force: argv.includes("--force"), dryRun: argv.includes("--dry-run") };
}

async function main() {
  const { force, dryRun } = parseArgs(process.argv.slice(2));
  const content = JSON.parse(readFileSync(CONTENT_FILE, "utf8"));
  const plan = buildPlan(content);

  const credentials = readCredentials();
  if (!credentials && !dryRun) {
    throw new Error(
      "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY_BASE64 veya FIREBASE_PRIVATE_KEY zorunludur.",
    );
  }

  // Dry-run kimlik bilgisi yoksa Firestore'a bağlanmaz; mevcut belge kontrolü yapılamaz.
  let existing = null;
  if (credentials) {
    const app =
      getApps()[0] ??
      initializeApp({
        credential: cert(credentials),
        projectId: credentials.projectId,
      });
    const db = getFirestore(app);
    const refs = plan.map((entry) => db.collection(entry.collection).doc(entry.id));
    const snapshots = refs.length ? await db.getAll(...refs) : [];
    existing = snapshots.map((snapshot) => snapshot.exists);

    const counts = { create: 0, update: 0, skip: 0 };
    const writes = [];
    plan.forEach((entry, index) => {
      const label = `${entry.collection}/${entry.id}`;
      if (!existing[index]) {
        counts.create += 1;
        writes.push({ ref: refs[index], entry, mode: "create" });
        console.log(`${dryRun ? "[dry-run] " : ""}oluşturulacak: ${label}`);
      } else if (force) {
        counts.update += 1;
        writes.push({ ref: refs[index], entry, mode: "update" });
        console.log(`${dryRun ? "[dry-run] " : ""}güncellenecek: ${label}`);
      } else {
        counts.skip += 1;
        console.log(`atlandı (mevcut): ${label}`);
      }
    });

    if (!dryRun) {
      for (let start = 0; start < writes.length; start += BATCH_SIZE) {
        const batch = db.batch();
        for (const { ref, entry, mode } of writes.slice(start, start + BATCH_SIZE)) {
          if (mode === "create") {
            batch.set(ref, {
              ...entry.data,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            // Güncellemede seed'de görsel yoksa mevcut (yönetici yüklemesi) görsel korunur.
            const { imageUrl, imagePath, ...fields } = entry.data;
            batch.set(
              ref,
              {
                ...fields,
                ...(imageUrl ? { imageUrl, imagePath } : {}),
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true },
            );
          }
        }
        await batch.commit();
      }
    }
    console.log(
      `${dryRun ? "Dry-run tamamlandı" : "Tamamlandı"}: ${counts.create} oluşturuldu, ${counts.update} güncellendi, ${counts.skip} atlandı.`,
    );
    return;
  }

  // Yalnız dry-run ve kimlik bilgisi yok: plan, Firestore kontrolü olmadan listelenir.
  console.log("Kimlik bilgisi yok; Firestore kontrolü yapılmadan plan gösteriliyor.");
  for (const entry of plan) {
    console.log(`[dry-run] yazılacak: ${entry.collection}/${entry.id}`);
  }
  console.log(`[dry-run] ${plan.length} belge incelendi; hiçbir şey yazılmadı.`);
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
