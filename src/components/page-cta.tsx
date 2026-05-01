import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export function PageCTA() {
  const t = useTranslations("common");
  const tf = useTranslations("footer");

  return (
    <section className="py-12 md:py-16 bg-brand-navy text-white text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          {t("ctaTitle")}
        </h2>
        <p className="text-white/85 mb-6 text-sm font-medium leading-relaxed">
          {t("ctaDesc")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/quote">
            <Button
              size="lg"
              className="bg-brand-copper hover:bg-brand-copper-light text-white px-8 font-semibold"
            >
              {t("requestQuote")}
            </Button>
          </Link>
          <a
            href={`tel:${tf("phone")}`}
            className="flex items-center gap-2 text-white/85 hover:text-white transition-colors text-sm font-semibold tabular-nums"
          >
            <Phone className="w-4 h-4" />
            <span>{tf("phone")}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
