"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";

export function ScrollAnimationObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05 }
    );

    // Re-scan on every route change. The layout (and this observer) persist
    // across client-side navigation, so a one-time `[]` effect never saw the
    // new page's [data-animate] elements — they stayed opacity:0 until the 1s
    // CSS fallback, which made hero text appear ~1s late (or blank if caught
    // earlier). Re-observing per pathname reveals above-the-fold content at once.
    document
      .querySelectorAll("[data-animate]:not(.is-visible)")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
