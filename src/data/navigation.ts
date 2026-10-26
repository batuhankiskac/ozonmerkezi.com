import site from "./site.json";

export interface NavigationLink {
  href: string;
  label: string;
}

// Ana menü bağlantıları site.json içinden gelir. Ana sayfa bölümlerine giden
// "/#..." bağlantıları diğer sayfalardan da ana sayfaya gider.
export const navigationLinks: NavigationLink[] = site.navigation;

// Menüde "İletişim" bağlantısı dolgulu düğme olarak gösterilir.
export const contactHref = "/iletisim";

// Yalnız alt bilgide gösterilir; ana menüye eklenmez.
export const privacyLink: NavigationLink = {
  href: "/gizlilik",
  label: "Gizlilik ve Çerez Politikası",
};

// Admin girişinden sonra ve /admin kökünden açılan varsayılan sayfa.
export const ADMIN_HOME = "/admin/makaleler";

export function isActivePath(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
