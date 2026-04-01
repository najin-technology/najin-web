import { useTranslations } from "next-intl";
import { ImageFade } from "@/components/image-fade";

export function PageHeader({
  titleKey,
  namespace,
  descriptionKey,
  bgImage,
}: {
  titleKey: string;
  namespace: string;
  descriptionKey?: string;
  bgImage?: string;
}) {
  const t = useTranslations(namespace);

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
      </div>
      {/* Diagonal bottom clip */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
    </section>
  );
}
