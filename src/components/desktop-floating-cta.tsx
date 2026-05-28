"use client";

import { useState, useEffect } from "react";
import { Phone, FileText } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const TEL = "+82-55-367-2596";
const TEL_DISPLAY = "055-367-2596";

export function DesktopFloatingCTA() {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past initial hero area (40vh)
      setVisible(window.scrollY > window.innerHeight * 0.4);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3"
      data-animate="fade-up"
    >
      <a
        href={`tel:${TEL}`}
        aria-label={`전화 걸기 ${TEL_DISPLAY}`}
        className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-surface-warm-200 hover:border-brand-copper text-brand-charcoal hover:text-brand-copper text-sm font-semibold rounded-full shadow-lg transition-all tabular-nums"
      >
        <Phone className="w-4 h-4 text-brand-copper" />
        <span className="hidden lg:inline">{TEL_DISPLAY}</span>
        <span className="lg:hidden">전화</span>
      </a>
      <Link
        href="/quote"
        className="inline-flex items-center gap-2 px-5 py-3 bg-brand-copper hover:bg-brand-copper-light text-white text-sm font-semibold rounded-full shadow-lg shadow-brand-copper/20 transition-colors"
      >
        <FileText className="w-4 h-4" />
        {t("requestQuote")}
      </Link>
    </div>
  );
}
