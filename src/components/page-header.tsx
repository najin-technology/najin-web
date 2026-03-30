import { useTranslations } from "next-intl";

export function PageHeader({
  titleKey,
  namespace,
  descriptionKey,
}: {
  titleKey: string;
  namespace: string;
  descriptionKey?: string;
}) {
  const t = useTranslations(namespace);

  return (
    <section className="hero-gradient hero-pattern text-white py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold"
          data-animate="fade-up"
        >
          {t(titleKey)}
        </h1>
        {descriptionKey && (
          <p
            className="text-gray-300 mt-3 text-lg max-w-2xl"
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
