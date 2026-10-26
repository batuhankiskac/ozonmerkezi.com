import type { AnchorHTMLAttributes } from "react";

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
> & { href: string };

// Yeni sekmede açılan dış bağlantı; ekran okuyuculara bu durum bildirilir.
export default function ExternalLink({ children, ...props }: ExternalLinkProps) {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (yeni sekmede açılır)</span>
    </a>
  );
}
