import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "사업영역",
};

const categories = [
  { key: "urethane", icon: "🔧" },
  { key: "resin", icon: "⚙️" },
  { key: "cnc", icon: "🏭" },
  { key: "mold", icon: "🔩" },
  { key: "ev", icon: "🔋" },
] as const;

export default function BusinessPage() {
  const t = useTranslations("business");

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="business" />

      {/* Category Quick Nav */}
      <nav className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <a
                key={cat.key}
                href={`#${cat.key}`}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium text-[#2D3748] hover:text-[#3182CE] hover:bg-gray-50 rounded-md transition-colors"
              >
                <span className="mr-1">{cat.icon}</span>
                {t(`${cat.key}.title`)}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Category Sections */}
      {categories.map((cat, index) => (
        <section
          key={cat.key}
          id={cat.key}
          className={`py-12 md:py-16 ${index % 2 === 1 ? "bg-gray-50" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{cat.icon}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1B2A4A]">
                  {t(`${cat.key}.title`)}
                </h2>
              </div>
              <p className="text-[#2D3748] leading-relaxed mb-6">
                {t(`${cat.key}.desc`)}
              </p>
              <div className="flex flex-wrap gap-2">
                {t(`${cat.key}.features`)
                  .split(" · ")
                  .map((feature) => (
                    <span
                      key={feature}
                      className="inline-block px-3 py-1 text-xs font-medium text-[#3182CE] bg-blue-50 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
