import { useTranslations } from "next-intl";

export function PageHeader({
  titleKey,
  namespace,
}: {
  titleKey: string;
  namespace: string;
}) {
  const t = useTranslations(namespace);

  return (
    <section className="bg-[#1B2A4A] text-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t(titleKey)}</h1>
      </div>
    </section>
  );
}
