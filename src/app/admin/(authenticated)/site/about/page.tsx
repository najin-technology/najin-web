import { requireAdmin } from "@/lib/auth";
import { getSiteAbout } from "@/lib/queries";
import { AboutForm } from "./about-form";

export const metadata = {
  title: "회사 정보 (About)",
  description: "About 페이지 콘텐츠 (CEO 인사말 등)",
  robots: "noindex, nofollow",
};

export default async function AdminSiteAboutPage() {
  await requireAdmin();
  const data = await getSiteAbout();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">회사 정보 (About)</h1>
        <p className="mt-1.5 text-sm text-gray-600">
          About 페이지에 표시되는 CEO 인사말입니다. 이 콘텐츠는 코드(GitHub)에는 저장되지 않고 DB 에만 보관됩니다.
        </p>
      </div>
      <AboutForm initial={data} />
    </div>
  );
}
