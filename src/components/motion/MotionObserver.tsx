"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const FRAMES: Record<string, Keyframe[]> = {
  rise: [
    { opacity: 0, transform: "translate3d(0, 28px, 0)" },
    { opacity: 1, transform: "none" },
  ],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  scale: [
    { opacity: 0, transform: "scale(0.97)" },
    { opacity: 1, transform: "none" },
  ],
  mask: [
    { clipPath: "inset(100% 0 0 0)", transform: "scale(1.06)" },
    { clipPath: "inset(0 0 0 0)", transform: "none" },
  ],
};

// İlk yüklemede ekranda olan öğeler canlandırılmaz (SSR ile zaten
// görünürler); sonraki gezinmelerde yeni sayfanın görünen kısmı da açılır.
let isFirstScan = true;

function framesFor(element: HTMLElement) {
  return FRAMES[element.dataset.reveal || "rise"] ?? FRAMES.rise;
}

// Bekleme karesi. "mask" tamamen kırpılmış başlarsa IntersectionObserver onu
// hiç kesişiyor saymaz ve öğe gizli kalır; bu yüzden beklerken yalnız saydam
// tutulur, kırpma açılış animasyonunun ilk karesinde başlar.
function holdFrame(element: HTMLElement): Keyframe {
  return element.dataset.reveal === "mask" ? { opacity: 0 } : framesFor(element)[0];
}

// [data-reveal] öğelerini ekrana girdiklerinde bir kez, sabit sürede açar.
// Web Animations API kullanılır; DOM öznitelikleri değişmediği için React
// hidrasyonu etkilenmez. Akışla sonradan gelen öğeleri MutationObserver yakalar.
export default function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animateIn = isFirstScan === false;
    isFirstScan = false;
    const hidden = new Map<Element, Animation>();
    const seen = new WeakSet<Element>();

    const reveal = (element: HTMLElement) => {
      hidden.get(element)?.cancel();
      hidden.delete(element);
      const index = Number(getComputedStyle(element).getPropertyValue("--i")) || 0;
      element.animate(framesFor(element), {
        duration: element.dataset.reveal === "mask" ? 1300 : 900,
        delay: index * 90,
        easing: EASE,
        fill: "backwards",
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          reveal(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );

    const register = (element: HTMLElement) => {
      if (seen.has(element)) return;
      seen.add(element);
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (animateIn) reveal(element);
        return;
      }
      // Ekran dışındaki öğe, görünene kadar ilk karede tutulur.
      hidden.set(
        element,
        element.animate([holdFrame(element)], { duration: 0, fill: "forwards" }),
      );
      observer.observe(element);
    };

    const scan = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(register);

    scan(document);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]")) register(node);
          scan(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      hidden.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return null;
}
