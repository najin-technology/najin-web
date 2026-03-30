import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");

  return (
    <footer className="bg-[#1B2A4A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {tc("companyNameFull")}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t("address")}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>TEL: {t("phone")}</p>
              <p>FAX: {t("fax")}</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/quote"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                {tc("requestQuote")}
              </Link>
              <Link
                href="/privacy"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                {t("privacy")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
