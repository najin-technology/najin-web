"use client";

import { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function MobileCTA() {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (roughly 60vh)
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-brand-navy/95 backdrop-blur-sm border-t border-white/10 px-4 py-2.5 flex items-center justify-between gap-3">
      <a
        href="tel:055-367-2596"
        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
      >
        <Phone className="w-4 h-4" />
        <span>055-367-2596</span>
      </a>
      <Link
        href="/quote"
        className="bg-brand-copper hover:bg-brand-copper-light text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {t("requestQuote")}
      </Link>
    </div>
  );
}
