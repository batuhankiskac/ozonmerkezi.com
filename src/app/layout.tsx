import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import site from "@/data/site.json";
import { SITE_NAME } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Başlık ve metin yazı tipleri; globals.css bunları --font-display ve
// --font-body değişkenlerinden okur.
const display = Newsreader({
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  // Önyüklenmez: mobilde ağ bant genişliğini hero görseline bırakır.
  preload: false,
});

const body = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

// Yalnız tüm sayfalar için geçerli varsayılanlar; sayfaya özel başlık, url ve
// canonical her sayfada pageMetadata() ile tanımlanır.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: site.seo.home.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: site.seo.home.description,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE_NAME,
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body className={`${body.variable} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}
