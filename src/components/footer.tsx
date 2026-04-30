import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/logo";
import { Phone, MapPin, Printer } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");

  return (
    <footer className="bg-gradient-to-b from-brand-navy to-brand-navy-deep text-white">
      {/* Copper accent line */}
      <div className="h-1 bg-gradient-to-r from-brand-copper/0 via-brand-copper to-brand-copper/0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Company Info */}
          <div>
            <Logo variant="light" size="lg" />
            <p className="text-sm text-white/70 mt-4 leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-white/80 uppercase tracking-wider mb-4">
              {t("quickLinks")}
            </h3>
            <div className="space-y-2.5 text-sm">
              <Link
                href="/about"
                className="block text-white/80 hover:text-white transition-colors"
              >
                {tn("about")}
              </Link>
              <Link
                href="/business"
                className="block text-white/80 hover:text-white transition-colors"
              >
                {tn("business")}
              </Link>
              <Link
                href="/quote"
                className="block text-white/80 hover:text-white transition-colors"
              >
                {tc("requestQuote")}
              </Link>
              <Link
                href="/posts"
                className="block text-white/80 hover:text-white transition-colors"
              >
                {tn("posts")}
              </Link>
              <Link
                href="/privacy"
                className="block text-white/80 hover:text-white transition-colors"
              >
                {t("privacy")}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold text-white/80 uppercase tracking-wider mb-4">
              {t("contactInfo")}
            </h3>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-copper shrink-0" />
                <span className="leading-relaxed">{t("address")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-copper shrink-0" />
                <span className="font-semibold tabular-nums">{t("phone")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-brand-copper shrink-0" />
                <span className="font-medium tabular-nums">{t("fax")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-[13px] text-white/75 font-medium">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
