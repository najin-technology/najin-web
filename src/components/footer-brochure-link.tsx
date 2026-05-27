import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSiteAbout } from "@/lib/queries";
import { documentsUrl } from "@/lib/storage-public";

export async function FooterBrochureLink() {
  const siteAbout = await getSiteAbout();
  const brochurePath = siteAbout?.brochure_pdf_path ?? null;
  if (!brochurePath) return null;

  const t = await getTranslations("about.brochure");

  return (
    <a
      href={documentsUrl(brochurePath)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      {t("title")}
    </a>
  );
}
