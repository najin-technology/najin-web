import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ImageFade } from "@/components/image-fade";

type HeaderCTA = {
  /** i18n key resolved against the page namespace (or "common" when ns is omitted) */
  labelKey: string;
  href: string;
  /** When set, resolve labelKey against this namespace instead of the page namespace */
  ns?: string;
};

export function PageHeader({
  titleKey,
  namespace,
  descriptionKey,
  bgImage,
  cta,
}: {
  titleKey: string;
  namespace: string;
  descriptionKey?: string;
  bgImage?: string;
  cta?: HeaderCTA;
}) {
  const t = useTranslations(namespace);
  const tCommon = useTranslations("common");

  return (
    <section className="relative text-white py-20 md:py-28 overflow-hidden">
      {/* Background photo + overlay */}
      {bgImage && (
        <ImageFade
          src={bgImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className={`absolute inset-0 ${bgImage ? "bg-brand-navy/75" : "hero-gradient hero-pattern"}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          data-animate="fade-up"
        >
          {t(titleKey)}
        </h1>
        {descriptionKey && (
          <p
            className="text-white/85 mt-3 text-lg max-w-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
            data-animate="fade-up"
            data-animate-delay="1"
          >
            {t(descriptionKey)}
          </p>
        )}
        {cta && (
          <div
            className="mt-7"
            data-animate="fade-up"
            data-animate-delay="2"
          >
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-copper hover:bg-brand-copper-light text-white text-sm md:text-base font-semibold rounded-lg transition-colors shadow-lg shadow-black/20"
            >
              {cta.ns === "common"
                ? tCommon(cta.labelKey)
                : cta.ns
                ? // Fall back to the page namespace's translator for any other namespace
                  // (next-intl requires a fixed namespace per useTranslations call, so we
                  // keep custom namespaces resolved against the page namespace for now)
                  t(cta.labelKey)
                : t(cta.labelKey)}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
      {/* Diagonal bottom clip */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
    </section>
  );
}
