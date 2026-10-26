import type { CSSProperties } from "react";
import bioData from "@/data/bio.json";
import contactData from "@/data/contact.json";
import siteData from "@/data/site.json";
import { pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

// data-enter ve data-reveal gecikmeleri: sıra numarası CSS'te --i olarak okunur.
const enterDelay = (i: number) => ({ "--i": i }) as CSSProperties;
const revealDelay = (i: number) => ({ "--i": i % 4 }) as CSSProperties;

const DESCRIPTION =
  "Kişisel verilerin işlenmesi, çerez kullanımı ve KVKK kapsamındaki haklarınız hakkında aydınlatma metni.";

export const metadata = pageMetadata({
  title: "Gizlilik ve Çerez Politikası",
  description: DESCRIPTION,
  path: "/gizlilik",
});

// İçindekiler; id'ler aşağıdaki başlıklarla birebir aynı olmalıdır.
const TOC = [
  { id: "veri-sorumlusu", label: "1. Veri sorumlusu" },
  { id: "islenen-veriler", label: "2. İşlenen veriler" },
  { id: "isleme-amaclari", label: "3. İşleme amaçları" },
  { id: "hukuki-sebepler", label: "4. Hukuki sebepler (KVKK m.5)" },
  { id: "yurt-disi-aktarim", label: "5. Yurt dışına aktarım" },
  { id: "saklama-sureleri", label: "6. Saklama süreleri" },
  { id: "cerez-tercihleri", label: "7. Çerez tercihleriniz" },
  { id: "haklariniz", label: "8. KVKK kapsamındaki haklarınız (m.11)" },
];

// Metin taslaktır; yayımlanmadan önce bir avukat tarafından gözden geçirilmelidir.
export default function PrivacyPage() {
  return (
    <main id="main-content" className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow} data-enter style={enterDelay(0)}>
          Yasal Bilgilendirme
        </p>
        <h1 className={styles.title} data-enter style={enterDelay(1)}>
          Gizlilik ve Çerez Politikası / KVKK Aydınlatma Metni
        </h1>
        <p className={styles.lead} data-enter style={enterDelay(2)}>
          {DESCRIPTION}
        </p>
      </header>

      <div className={styles.body}>
        <div className={styles.layout}>
          <nav
            className={styles.toc}
            aria-label="İçindekiler"
            data-reveal="fade"
          >
            <p className={styles.tocTitle} aria-hidden="true">
              İçindekiler
            </p>
            <ul className={styles.tocList}>
              {TOC.map((item) => (
                <li key={item.id}>
                  <a className={styles.tocLink} href={`#${item.id}`}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.prose}>
            <section
              className={styles.section}
              data-reveal
              style={revealDelay(0)}
            >
              <h2 id="veri-sorumlusu" className={styles.subheading}>
                1. Veri sorumlusu
              </h2>
              <p>
                {siteData.brand.siteName} ({siteData.brand.domain}) web sitesinde
                işlenen kişisel veriler bakımından veri sorumlusu {bioData.name}{" "}
                şahsıdır.
              </p>
              <ul className={styles.list}>
                <li>Adres: {contactData.address}</li>
                <li>Telefon: {contactData.phone}</li>
              </ul>
            </section>

            <section
              className={styles.section}
              data-reveal
              style={revealDelay(1)}
            >
              <h2 id="islenen-veriler" className={styles.subheading}>
                2. İşlenen veriler
              </h2>
              <ul className={styles.list}>
                <li>
                  <strong>İletişim tıklamaları:</strong> Telefon ve WhatsApp
                  bağlantılarına tıklama olayı, bağlantının türü ve sayfa yolu. Bu
                  olay yalnız analiz izni verdiğinizde Google Tag Manager ve Google
                  Analytics üzerinden iletilir.
                </li>
                <li>
                  <strong>Analiz ve reklam çerezleri:</strong> Google Tag Manager,
                  Google Analytics ve Google Ads tarafından yalnız açık rızanızla
                  yerleştirilen çerezler ve benzeri tanımlayıcılar.
                </li>
                <li>
                  <strong>Sunucu kayıtları:</strong> IP adresi, istek zamanı,
                  istenen sayfa ve tarayıcı bilgisi. Barındırma ve güvenlik
                  altyapısı tarafından tutulur.
                </li>
                <li>
                  <strong>Yönetici girişi:</strong> Yönetim paneline giriş yapan
                  yöneticinin e-posta adresi, Firebase Authentication kimlik
                  bilgileri ve yalnız yöneticiye ait oturum çerezi.
                </li>
              </ul>
              <p>
                Sitenin ziyaretçilere sunduğu içerikler için hesap oluşturmanız
                gerekmez ve bu sitede kişisel veri formu bulunmaz.
              </p>
            </section>

            <section
              className={styles.section}
              data-reveal
              style={revealDelay(2)}
            >
              <h2 id="isleme-amaclari" className={styles.subheading}>
                3. İşleme amaçları
              </h2>
              <ul className={styles.list}>
                <li>Sitenin güvenli ve doğru çalışmasını sağlamak.</li>
                <li>
                  Telefon ve WhatsApp üzerinden yapılan iletişim taleplerinin
                  ölçülmesi ve sitenin iyileştirilmesi.
                </li>
                <li>
                  İzin verilmesi hâlinde reklam ölçümü ve dönüşüm takibi yapılması.
                </li>
                <li>Yönetim panelinin yetkisiz erişime karşı korunması.</li>
              </ul>
            </section>

            <section
              className={styles.section}
              data-reveal
              style={revealDelay(3)}
            >
              <h2 id="hukuki-sebepler" className={styles.subheading}>
                4. Hukuki sebepler (KVKK m.5)
              </h2>
              <ul className={styles.list}>
                <li>
                  Analiz ve reklam çerezleri ile bunlara bağlı iletişim tıklaması
                  verileri: açık rıza (m.5/1).
                </li>
                <li>
                  Sunucu kayıtları ve yönetici girişi: veri sorumlusunun meşru
                  menfaati olan site güvenliği ve yasal yükümlülüklerin yerine
                  getirilmesi (m.5/2-ç, m.5/2-f).
                </li>
              </ul>
            </section>

            <section
              className={styles.section}
              data-reveal
              style={revealDelay(4)}
            >
              <h2 id="yurt-disi-aktarim" className={styles.subheading}>
                5. Yurt dışına aktarım
              </h2>
              <p>
                Google Tag Manager, Google Analytics ve Google Ads hizmetleri ile
                Firebase (veritabanı, dosya depolama ve kimlik doğrulama) Google LLC
                ve bağlı kuruluşları tarafından sunulur. Bu nedenle analiz izni
                verdiğinizde ilgili veriler Türkiye dışındaki sunucularda
                işlenebilir. Aktarım, KVKK m.9 kapsamında açık rıza ve ilgili
                hizmetin gerektirdiği ölçüde yapılır.
              </p>
            </section>

            <section
              className={styles.section}
              data-reveal
              style={revealDelay(5)}
            >
              <h2 id="saklama-sureleri" className={styles.subheading}>
                6. Saklama süreleri
              </h2>
              <ul className={styles.list}>
                <li>
                  Analiz ve reklam çerezleri: Google&apos;ın ilgili çerez için
                  belirlediği süre (birkaç günden en fazla iki yıla kadar).
                </li>
                <li>
                  Çerez tercihiniz: Tarayıcınızın yerel depolamasında
                  (&quot;analytics-consent&quot;) tutulur; tarayıcı verilerini
                  temizleyerek silebilirsiniz.
                </li>
                <li>
                  Sunucu kayıtları: Barındırma sağlayıcısının yasal saklama süresi
                  boyunca.
                </li>
                <li>
                  Yönetici oturum çerezi: En fazla 5 gün; çıkış yapıldığında hemen
                  geçersiz kılınır.
                </li>
              </ul>
            </section>

            <section
              className={styles.section}
              data-reveal
              style={revealDelay(6)}
            >
              <h2 id="cerez-tercihleri" className={styles.subheading}>
                7. Çerez tercihleriniz
              </h2>
              <p>
                Sitenin altındaki <strong>&quot;Çerez tercihleri&quot;</strong>{" "}
                bağlantısıyla tercihinizi istediğiniz zaman değiştirebilirsiniz.
                &quot;Reddet&quot; seçeneğini işaretlediğinizde analiz ve reklam
                çerezleri devre dışı kalır ve Google&apos;a yeni analiz verisi
                gönderilmez. Mevcut sayfada GTM yüklüyse yalnız izin durumu
                güncellenir; yeniden yüklenen sayfalarda GTM yalnız tekrar kabul
                ettiğinizde yüklenir.
              </p>
            </section>

            <section
              className={styles.section}
              data-reveal
              style={revealDelay(7)}
            >
              <h2 id="haklariniz" className={styles.subheading}>
                8. KVKK kapsamındaki haklarınız (m.11)
              </h2>
              <ul className={styles.list}>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme.</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme.</li>
                <li>
                  İşlenme amacını ve bunların amacına uygun kullanılıp
                  kullanılmadığını öğrenme.
                </li>
                <li>
                  Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri
                  bilme.
                </li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme.</li>
                <li>
                  KVKK m.7 kapsamında silinmesini veya yok edilmesini isteme ve bu
                  işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme.
                </li>
                <li>
                  İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi
                  sonucu aleyhinize bir sonuç doğmasına itiraz etme.
                </li>
                <li>
                  Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın
                  giderilmesini talep etme.
                </li>
              </ul>
              <p>
                Başvurularınızı yukarıdaki adres veya telefon üzerinden iletebilirsiniz.
                Kimliğinizi doğrulamak için ek bilgi isteyebiliriz. Başvurunuz en geç
                otuz gün içinde yanıtlanır. Yanıtı yetersiz bulmanız hâlinde Kişisel
                Verileri Koruma Kurulu&apos;na şikâyette bulunabilirsiniz.
              </p>
            </section>

            <p className={styles.notice} data-reveal>
              Bu metin bir şablondur. Yayımlanmadan önce veri sorumlusunun durumu,
              kullanılan hizmetler ve ilgili mevzuat bakımından bir avukat tarafından
              incelenmeli ve gerekirse güncellenmelidir.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
