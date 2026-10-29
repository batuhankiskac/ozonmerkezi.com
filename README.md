# ozonmerkezi.com

Ozon Merkezi (Prof. Dr. Muharrem Kıskaç) web sitesi ve içerik yönetim paneli.
Next.js 16 ile yazılmıştır. Public sayfalar Firebase Admin ile sunucuda render
edilir; tarayıcıya yalnız admin girişinde gereken Firebase Auth kodu gönderilir.

Public görünüm, Prof. Dr. Muharrem Kıskaç sitelerinin ortak tasarım sistemini
(renk tokenları `src/app/globals.css`, Newsreader + Geist) kullanır. İçerik
(makaleler, videolar) Firestore’dan okunur ve admin panelinden yönetilir.

## Sayfalar

| Yol | İçerik |
| --- | --- |
| `/` | Ana sayfa (`src/data/site.json` içindeki `home.sections`; `#nedir`, `#yontemler`, `#kullanim-alanlari`, `#surec`, `#dikkat`, `#iletisim` çapaları) |
| `/makaleler` | Makale listesi — Firestore `articles` |
| `/makaleler/[id]` | Makale detayı |
| `/videolar` | Videolar — Firestore `videos` |
| `/iletisim` | Adres, telefon, çalışma saatleri, harita |
| `/gizlilik` | Gizlilik ve Çerez Politikası / KVKK Aydınlatma Metni |
| `/admin` | Yönetim paneli (giriş gerekir) |

Yeni bir alan adıdır; eski adres yönlendirmesi yoktur.

Hizmetler bu sitede yoktur; `/hizmetler` sayfası bulunmaz. Admin panelindeki
Hizmetler bölümü ileride kullanım için korunmuştur.

Alt bilgideki “Bağlantılar” sütunu kardeş siteleri (profdrmuharremkiskac.com,
doktorhacamat.com, siboklinik.com) ve sosyal hesapları listeler
(`site.json` → `footer.links`).

## Marka görselleri

`public/og.jpg` (1200×630) ve `src/app/favicon.ico`, `icon.png`,
`apple-icon.png` dosyaları `globals.css` renk tokenlarından üretilir. Palet
değişirse yeniden üretin:

```bash
python3 scripts/generate-brand-images.py
```

## Gereksinimler

- Node.js 22+
- Bu site için ayrı bir Firebase projesi (aşağıdaki kurulum adımları)

## Yerel kurulum

```bash
npm ci
cp env-example.txt .env.local
npm run dev
```

`.env.local` içindeki `NEXT_PUBLIC_FIREBASE_*` değerleri yalnız giriş ekranında
kullanılır. `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` ve
`FIREBASE_PRIVATE_KEY` (ya da `FIREBASE_PRIVATE_KEY_BASE64`) gibi Admin değerleri
yalnız sunucuda tutulmalı, `NEXT_PUBLIC_` öneki almamalı ve repoya eklenmemelidir.

## Firebase projesini kurma

Bu site, başka bir sitenin Firebase projesini kullanmaz. Sırasıyla:

1. [Firebase Console](https://console.firebase.google.com/) üzerinde yeni bir
   proje oluşturun (ör. `ozonmerkezi`).
2. **Authentication** → Sign-in method: **E-posta/Şifre** sağlayıcısını etkinleştirin.
   **Users** sekmesinden yönetici kullanıcıyı e-posta ve şifreyle ekleyin.
3. **Firestore Database** oluşturun (production modunda). Koleksiyonlar
   (`articles`, `services`, `videos`) ilk kayıtla birlikte oluşur.
4. **Storage** oluşturun. Yüklenen görseller bu bucket’a yazılır.
5. Uygulama (web) kaydı ekleyin ve `NEXT_PUBLIC_FIREBASE_*` değerlerini alın.
6. **Project settings → Service accounts** bölümünden yeni bir özel anahtar
   (JSON) oluşturun; `project_id`, `client_email` ve `private_key` değerlerini
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` ve `FIREBASE_PRIVATE_KEY_BASE64`
   (önerilir) olarak `.env.local` dosyasına yazın. Anahtarı repoya eklemeyin.
7. Yönetici hesabına `admin: true` custom claim’i verin. Yalnız e-posta eşleşmesi
   yönetici yetkisi sağlamaz. Claim’i şu betikle verebilirsiniz (e-posta adresini
   kendi yöneticinizle değiştirin):

   ```bash
   node --env-file=.env.local --input-type=module -e '
   import { cert, initializeApp } from "firebase-admin/app";
   import { getAuth } from "firebase-admin/auth";
   const key = process.env.FIREBASE_PRIVATE_KEY_BASE64
     ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
     : process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
   const app = initializeApp({
     credential: cert({
       projectId: process.env.FIREBASE_PROJECT_ID,
       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
       privateKey: key,
     }),
   });
   const user = await getAuth(app).getUserByEmail("yonetici@ornek.com");
   await getAuth(app).setCustomUserClaims(user.uid, { admin: true });
   console.log("admin claim verildi:", user.uid);
   '
   ```

   Claim verildikten sonra yönetici panelden çıkıp yeniden giriş yapmalıdır.

8. Kuralları yayımlayın (aşağıdaki bölüm).

## Firestore ve Storage kuralları

`firestore.rules` ve `storage.rules` istemci erişimini admin claim’iyle sınırlar.
Kuralları production’a almadan önce Firebase CLI ile doğru projeyi seçin:

```bash
firebase use --add            # bu Firebase projesini seçin
firebase deploy --only firestore:rules,storage
```

## Tohumlama (seed)

`seed/content.json` içindeki kayıtları (makale, hizmet, video) Firestore’a
yazar. Kimlikler JSON’daki `id` değerleridir. Dosya şu an boştur: makaleler
admin panelinden eklenir.

```bash
npm run seed -- --dry-run   # yazmadan ne yapılacağını listeler
npm run seed                # eksik belgeleri oluşturur; mevcutlara dokunmaz
npm run seed -- --force     # mevcut belgeleri seed verisiyle günceller
```

Betik `.env.local` içindeki Admin değerlerini kullanır. Güncellemede seed’de
görsel yoksa mevcut (yönetici yüklemesi) görsel korunur. Yalnız `--dry-run`
kimlik bilgisi olmadan da çalışır; bu durumda mevcut belgeler kontrol edilmez.

## Veri ve güvenlik

- Public makale, hizmet ve video okumaları sunucudan yapılır.
- Admin oturumu doğrulanmış Firebase ID token’dan üretilen `HttpOnly` cookie
  kullanır.
- `/gizlilik` sayfasında veri sorumlusu Prof. Dr. Muharrem Kıskaç’tır; site adı
  ve alan adı `src/data/site.json`, iletişim bilgileri `src/data/contact.json`,
  hekim bilgisi `src/data/bio.json` dosyalarından okunur. Metin bir şablondur;
  yayımlanmadan önce avukat incelemesi gerekir. Sayfa alt bilgiden ve
  `sitemap.xml` üzerinden erişilebilir.
- Consent Mode v2 varsayılanları (`denied`) sunucu HTML’inde dataLayer’a yazılır.
  GTM (`gtm.js`) yalnız ziyaretçi analiz iznini kabul ettikten sonra yüklenir;
  reddedilen veya henüz seçilmemiş tercihte Google Tag Manager betiği hiç istenmez.
  Tercih alt bilgideki “Çerez tercihleri” düğmesiyle değiştirilebilir.
- Admin ekleme, güncelleme ve silme işlemleri server action olarak çalışır.
- Yüklenen görseller en fazla 5 MB kabul edilir, 1600 px içine küçültülür ve
  WebP olarak saklanır.
- Eski `image` alanlarını silmeden `imageUrl` alanına kopyalayan migration:

  ```bash
  npm run migrate:images
  ```

  Migration doğrulandıktan sonra legacy alanların kaldırılması ayrı bir bakım
  adımıdır.

## Kontroller

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Playwright testleri sistemde kurulu Google Chrome’u kullanır. Firebase Admin env
değerleri yoksa public koleksiyonlar boş gösterilir ve admin login entegrasyonu
yerine anonim ve sahte-cookie yönlendirme davranışı test edilir.
`E2E_ADMIN_EMAIL` ile `E2E_ADMIN_PASSWORD` tanımlandığında login, hizmet
ekleme-düzenleme-silme ve logout akışı da geçici bir kayıtla çalıştırılır.

## Production notları (Hostinger)

- Node.js 22 ortamında `npm ci && npm run build`, ardından `npm run start`
  çalıştırılır.
- Bütün server-only env değerleri (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
  `FIREBASE_PRIVATE_KEY_BASE64` veya `FIREBASE_PRIVATE_KEY`,
  `FIREBASE_STORAGE_BUCKET`) hosting panelinde tanımlanmalıdır.
- hCDN bot challenge ayarının Lighthouse ve güvenilir izleme araçlarına `403`
  döndürmediğini doğrulayın.
- Firestore verisi sunucuda yaklaşık 5 dakika önbelleğe alınır; admin işlemleri
  etiketi hemen günceller.
- Google Ads ve telefon dönüşümü GTM konteyneri içinde tutulmalıdır. Site yalnız
  kullanıcı analiz izni verdikten sonra GTM’yi yükler.
